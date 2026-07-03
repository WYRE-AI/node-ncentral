import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NCentralClient, AuthenticationError } from '../src/index.js';
import * as fixtures from './fixtures/index.js';
import { BASE_URL, TEST_JWT } from './mocks/handlers.js';
import { server } from './mocks/server.js';

function makeClient(overrides: Partial<ConstructorParameters<typeof NCentralClient>[0]> = {}) {
  return new NCentralClient({
    serverUrl: BASE_URL,
    jwt: TEST_JWT,
    maxRetries: 0,
    retryDelayMs: 1,
    requestsPerSecond: 1000,
    ...overrides,
  });
}

describe('authentication flow', () => {
  it('authenticates lazily on the first request and reuses the access token', async () => {
    let authCalls = 0;
    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, ({ request }) => {
        authCalls++;
        expect(request.headers.get('authorization')).toBe(`Bearer ${TEST_JWT}`);
        return HttpResponse.json(fixtures.authenticateResponse);
      }),
    );

    const client = makeClient();
    await client.system.health();
    await client.system.health();

    expect(authCalls).toBe(1);
  });

  it('sends the access token as a bearer on API calls', async () => {
    let seenAuthHeader: string | null = null;
    server.use(
      http.get(`${BASE_URL}/api/health`, ({ request }) => {
        seenAuthHeader = request.headers.get('authorization');
        return HttpResponse.json(fixtures.health);
      }),
    );

    await makeClient().system.health();
    expect(seenAuthHeader).toBe(`Bearer ${fixtures.ACCESS_TOKEN}`);
  });

  it('proactively refreshes when the access token nears expiry', async () => {
    let authCalls = 0;
    let refreshCalls = 0;
    let refreshBody: string | null = null;
    let refreshContentType: string | null = null;

    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, () => {
        authCalls++;
        // Access token expires in 30s — inside the 60s refresh buffer, so
        // the *next* request must trigger a refresh.
        return HttpResponse.json({
          tokens: {
            access: { token: fixtures.ACCESS_TOKEN, type: 'Bearer', expirySeconds: 30 },
            refresh: { token: fixtures.REFRESH_TOKEN, type: 'Body', expirySeconds: 90000 },
          },
        });
      }),
      http.post(`${BASE_URL}/api/auth/refresh`, async ({ request }) => {
        refreshCalls++;
        refreshContentType = request.headers.get('content-type');
        refreshBody = await request.text();
        return HttpResponse.json(fixtures.refreshResponse);
      }),
    );

    const client = makeClient();
    await client.system.health();
    await client.system.health();

    expect(authCalls).toBe(1);
    expect(refreshCalls).toBe(1);
    // The refresh request must carry the raw refresh token as text/plain.
    expect(refreshBody).toBe(fixtures.REFRESH_TOKEN);
    expect(refreshContentType).toContain('text/plain');
  });

  it('falls back to full re-authentication when the refresh fails', async () => {
    let authCalls = 0;
    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, () => {
        authCalls++;
        return HttpResponse.json({
          tokens: {
            access: {
              token: authCalls === 1 ? fixtures.ACCESS_TOKEN : fixtures.REFRESHED_ACCESS_TOKEN,
              type: 'Bearer',
              expirySeconds: authCalls === 1 ? 30 : 3600,
            },
            refresh: { token: fixtures.REFRESH_TOKEN, type: 'Body', expirySeconds: 90000 },
          },
        });
      }),
      http.post(`${BASE_URL}/api/auth/refresh`, () =>
        HttpResponse.json(fixtures.errorResponse401, { status: 401 }),
      ),
    );

    const client = makeClient();
    await client.system.health();
    await client.system.health(); // refresh fails → re-authenticate

    expect(authCalls).toBe(2);
  });

  it('re-authenticates once and retries when an API call returns 401', async () => {
    let authCalls = 0;
    let healthCalls = 0;
    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, () => {
        authCalls++;
        return HttpResponse.json(fixtures.authenticateResponse);
      }),
      http.get(`${BASE_URL}/api/health`, () => {
        healthCalls++;
        // Simulate a server-side token revocation: first call 401, then OK.
        if (healthCalls === 1) {
          return HttpResponse.json(fixtures.errorResponse401, { status: 401 });
        }
        return HttpResponse.json(fixtures.health);
      }),
    );

    const client = makeClient();
    const result = await client.system.health();

    expect(result.currentTime).toBe(fixtures.health.currentTime);
    expect(healthCalls).toBe(2);
    expect(authCalls).toBe(2); // initial auth + forced re-auth
  });

  it('throws AuthenticationError when 401 persists after re-authentication', async () => {
    server.use(
      http.get(`${BASE_URL}/api/health`, () =>
        HttpResponse.json(fixtures.errorResponse401, { status: 401 }),
      ),
    );

    const client = makeClient();
    await expect(client.system.health()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws AuthenticationError when the JWT itself is rejected', async () => {
    const client = makeClient({ jwt: 'wrong-jwt' });
    await expect(client.system.health()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('throws AuthenticationError when the authenticate response is malformed', async () => {
    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, () => HttpResponse.json({ tokens: {} })),
    );

    const client = makeClient();
    await expect(client.system.health()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('deduplicates concurrent authentication attempts', async () => {
    let authCalls = 0;
    server.use(
      http.post(`${BASE_URL}/api/auth/authenticate`, () => {
        authCalls++;
        return HttpResponse.json(fixtures.authenticateResponse);
      }),
    );

    const client = makeClient();
    await Promise.all([
      client.system.health(),
      client.system.health(),
      client.system.health(),
    ]);

    expect(authCalls).toBe(1);
  });
});
