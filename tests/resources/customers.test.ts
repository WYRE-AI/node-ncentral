import { describe, expect, it } from 'vitest';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('CustomersResource', () => {
  it('list() returns all customers', async () => {
    const page = await client.customers.list();
    expect(page.data[0].customerId).toBe('200');
    expect(page.totalItems).toBe(1);
  });

  it('get() returns a single customer', async () => {
    const result = await client.customers.get(200);
    expect(result.customerName).toBe('Acme Corp');
    expect(result.county).toBe('Davidson');
  });

  it('create() creates a customer under a service organization', async () => {
    const created = await client.customers.create(100, {
      customerName: 'Acme Corp',
      contactFirstName: 'Jane',
      contactLastName: 'Doe',
    });
    expect(created.customerName).toBe('Acme Corp');
  });

  it('sites() lists the customer sites', async () => {
    const page = await client.customers.sites(200);
    expect(page.data[0].siteName).toBe('Acme HQ');
  });

  it('registrationToken() unwraps the token envelope', async () => {
    const token = await client.customers.registrationToken(200);
    expect(token.registrationToken).toBe(
      fixtures.registrationTokenResponse.data.registrationToken,
    );
  });
});
