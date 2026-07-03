import { describe, expect, it } from 'vitest';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('SystemResource', () => {
  it('links() returns the API root links', async () => {
    const result = await client.system.links();
    expect(result._links?.health).toBe('/api/health');
  });

  it('health() returns the server time', async () => {
    const result = await client.system.health();
    expect(result.currentTime).toBe(fixtures.health.currentTime);
  });

  it('serverInfo() returns version info', async () => {
    const result = await client.system.serverInfo();
    expect(result.message).toBe(fixtures.serverInfo.message);
  });

  it('serverInfoExtra() returns extra version info', async () => {
    const result = await client.system.serverInfoExtra();
    expect(result.data).toEqual(fixtures.serverInfoExtra.data);
  });

  it('validateToken() validates the access token', async () => {
    const result = await client.system.validateToken();
    expect(result.message).toBe('The token is valid.');
  });
});
