import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  ForbiddenError,
  NCentralClient,
  NCentralError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from '../src/index.js';
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

function respondWith(status: number, body: unknown, headers?: Record<string, string>) {
  server.use(
    http.get(`${BASE_URL}/api/health`, () =>
      HttpResponse.json(body as Record<string, unknown>, { status, headers }),
    ),
  );
}

describe('error mapping', () => {
  it('maps 400 to ValidationError with field errors', async () => {
    respondWith(400, fixtures.errorResponse400);
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    const validation = error as ValidationError;
    expect(validation.statusCode).toBe(400);
    expect(validation.errors).toEqual(fixtures.errorResponse400.errors);
    expect(validation.response).toEqual(fixtures.errorResponse400);
    expect(validation.message).toContain('BAD REQUEST');
  });

  it('maps 403 to ForbiddenError', async () => {
    respondWith(403, fixtures.errorResponse403);
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ForbiddenError);
    expect((error as ForbiddenError).statusCode).toBe(403);
  });

  it('maps 404 to NotFoundError', async () => {
    respondWith(404, fixtures.errorResponse404);
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundError);
    expect((error as NotFoundError).statusCode).toBe(404);
    expect((error as NotFoundError).response).toEqual(fixtures.errorResponse404);
  });

  it('maps 422 to ValidationError', async () => {
    respondWith(422, fixtures.errorResponse422);
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).statusCode).toBe(422);
    expect((error as ValidationError).errors).toEqual(fixtures.errorResponse422.errors);
  });

  it('maps 429 to RateLimitError with retryAfter from the header', async () => {
    respondWith(429, fixtures.errorResponse429, { 'Retry-After': '17' });
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(17);
  });

  it('maps 500 to ServerError', async () => {
    respondWith(500, fixtures.errorResponse500);
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ServerError);
    expect((error as ServerError).statusCode).toBe(500);
  });

  it('maps other 4xx to NCentralError', async () => {
    respondWith(409, { status: 409, message: 'Conflict.' });
    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NCentralError);
    expect(error).not.toBeInstanceOf(ServerError);
    expect((error as NCentralError).statusCode).toBe(409);
  });

  it('handles non-JSON error bodies safely', async () => {
    server.use(
      http.get(`${BASE_URL}/api/health`, () =>
        HttpResponse.text('Bad Gateway', { status: 502 }),
      ),
    );

    const error = await makeClient()
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ServerError);
    expect((error as ServerError).response).toBe('Bad Gateway');
    expect((error as ServerError).message).toContain('Bad Gateway');
  });
});

describe('retry behaviour', () => {
  it('retries 429 responses and succeeds', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/api/health`, () => {
        calls++;
        if (calls === 1) {
          return HttpResponse.json(fixtures.errorResponse429, {
            status: 429,
            headers: { 'Retry-After': '0' },
          });
        }
        return HttpResponse.json(fixtures.health);
      }),
    );

    const result = await makeClient({ maxRetries: 2 }).system.health();
    expect(result.currentTime).toBe(fixtures.health.currentTime);
    expect(calls).toBe(2);
  });

  it('retries 5xx responses and succeeds', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/api/health`, () => {
        calls++;
        if (calls <= 2) {
          return HttpResponse.json(fixtures.errorResponse500, { status: 500 });
        }
        return HttpResponse.json(fixtures.health);
      }),
    );

    const result = await makeClient({ maxRetries: 3 }).system.health();
    expect(result.currentTime).toBe(fixtures.health.currentTime);
    expect(calls).toBe(3);
  });

  it('throws RateLimitError once retries are exhausted', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/api/health`, () => {
        calls++;
        return HttpResponse.json(fixtures.errorResponse429, {
          status: 429,
          headers: { 'Retry-After': '0' },
        });
      }),
    );

    const error = await makeClient({ maxRetries: 2 })
      .system.health()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(RateLimitError);
    expect(calls).toBe(3); // initial + 2 retries
  });

  it('does not retry validation errors', async () => {
    let calls = 0;
    server.use(
      http.get(`${BASE_URL}/api/health`, () => {
        calls++;
        return HttpResponse.json(fixtures.errorResponse400, { status: 400 });
      }),
    );

    await expect(makeClient({ maxRetries: 3 }).system.health()).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(calls).toBe(1);
  });
});

describe('query parameter serialization', () => {
  it('serializes pagination params and skips undefined values', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/devices`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json(fixtures.deviceList);
      }),
    );

    await makeClient().devices.list({
      pageNumber: 2,
      pageSize: 100,
      sortBy: 'deviceId',
      sortOrder: 'desc',
      filterId: 7,
      select: undefined,
    });

    const url = new URL(seenUrl);
    expect(url.searchParams.get('pageNumber')).toBe('2');
    expect(url.searchParams.get('pageSize')).toBe('100');
    expect(url.searchParams.get('sortBy')).toBe('deviceId');
    expect(url.searchParams.get('sortOrder')).toBe('desc');
    expect(url.searchParams.get('filterId')).toBe('7');
    expect(url.searchParams.has('select')).toBe(false);
  });
});
