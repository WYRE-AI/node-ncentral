import { describe, expect, it } from 'vitest';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('SitesResource', () => {
  it('list() returns all sites', async () => {
    const page = await client.sites.list();
    expect(page.data[0].siteId).toBe('300');
    expect(page.totalItems).toBe(1);
  });

  it('get() returns a single site', async () => {
    const result = await client.sites.get(300);
    expect(result.siteName).toBe('Acme HQ');
  });

  it('create() creates a site under a customer', async () => {
    const created = await client.sites.create(200, {
      siteName: 'Acme Branch',
      contactFirstName: 'Jane',
      contactLastName: 'Doe',
    });
    expect(created.siteId).toBe(301);
  });

  it('registrationToken() unwraps the token envelope', async () => {
    const token = await client.sites.registrationToken(300);
    expect(token.registrationTokenExpiryDate).toBe(
      fixtures.registrationTokenResponse.data.registrationTokenExpiryDate,
    );
  });
});
