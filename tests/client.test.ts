import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NCentralClient, normalizeServerUrl } from '../src/index.js';
import * as fixtures from './fixtures/index.js';
import { BASE_URL, TEST_JWT } from './mocks/handlers.js';
import { server } from './mocks/server.js';

describe('NCentralClient configuration', () => {
  it('requires a serverUrl', () => {
    expect(() => new NCentralClient({ serverUrl: '', jwt: 'x' })).toThrow(/serverUrl/);
  });

  it('requires a jwt', () => {
    expect(() => new NCentralClient({ serverUrl: BASE_URL, jwt: '' })).toThrow(/jwt/);
  });

  it('rejects a serverUrl without an http(s) scheme', () => {
    expect(() => new NCentralClient({ serverUrl: 'ncentral.test', jwt: 'x' })).toThrow(
      /https/,
    );
  });

  it('accepts http:// for lab servers', () => {
    expect(() => new NCentralClient({ serverUrl: 'http://lab.local', jwt: 'x' })).not.toThrow();
  });

  it('strips trailing slashes from the serverUrl', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/health`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json(fixtures.health);
      }),
    );

    const client = new NCentralClient({
      serverUrl: `${BASE_URL}///`,
      jwt: TEST_JWT,
      requestsPerSecond: 1000,
    });
    await client.system.health();

    expect(seenUrl).toBe(`${BASE_URL}/api/health`);
  });

  it('exposes every documented resource', () => {
    const client = new NCentralClient({ serverUrl: BASE_URL, jwt: TEST_JWT });
    expect(client.system).toBeDefined();
    expect(client.serviceOrgs).toBeDefined();
    expect(client.customers).toBeDefined();
    expect(client.sites).toBeDefined();
    expect(client.orgUnits).toBeDefined();
    expect(client.devices).toBeDefined();
    expect(client.deviceFilters).toBeDefined();
    expect(client.scheduledTasks).toBeDefined();
    expect(client.accessGroups).toBeDefined();
  });
});

describe('normalizeServerUrl', () => {
  it('strips trailing slashes and whitespace', () => {
    expect(normalizeServerUrl(' https://ncentral.example.com/ ')).toBe(
      'https://ncentral.example.com',
    );
  });

  it('throws on invalid URLs', () => {
    expect(() => normalizeServerUrl('ftp://nope')).toThrow();
    expect(() => normalizeServerUrl('')).toThrow();
  });
});

describe('raw request escape hatch', () => {
  it('performs an authenticated raw request', async () => {
    const client = new NCentralClient({
      serverUrl: BASE_URL,
      jwt: TEST_JWT,
      requestsPerSecond: 1000,
    });

    const result = await client.request<{ currentTime?: string }>('/api/health');
    expect(result.currentTime).toBe(fixtures.health.currentTime);
  });
});
