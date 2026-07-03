import { describe, expect, it } from 'vitest';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('ServiceOrgsResource', () => {
  it('list() returns a paginated envelope', async () => {
    const page = await client.serviceOrgs.list({ pageSize: 10 });
    expect(page.data).toHaveLength(1);
    expect(page.data[0].soName).toBe('WYRE Technology');
    expect(page.pageSize).toBe(10);
    expect(page.totalItems).toBe(1);
  });

  it('get() returns a single service organization', async () => {
    const so = await client.serviceOrgs.get(100);
    expect(so.soId).toBe('100');
    expect(so.isServiceOrg).toBe(true);
  });

  it('create() returns the created soId', async () => {
    const created = await client.serviceOrgs.create({
      soName: 'New SO',
      contactFirstName: 'A',
      contactLastName: 'B',
    });
    expect(created.soId).toBe(101);
  });

  it('customers() lists customers under the service organization', async () => {
    const page = await client.serviceOrgs.customers(100);
    expect(page.data[0].customerName).toBe('Acme Corp');
    expect(page.totalItems).toBe(1);
  });
});
