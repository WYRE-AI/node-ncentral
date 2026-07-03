import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';
import { server } from '../mocks/server.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('DeviceFiltersResource', () => {
  it('list() returns saved device filters', async () => {
    const page = await client.deviceFilters.list();
    expect(page.data).toHaveLength(2);
    expect(page.data[0].filterName).toBe('Windows Servers');
    expect(page.totalItems).toBe(2);
  });

  it('list() forwards the viewScope parameter', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/device-filters`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json(fixtures.deviceFilterList);
      }),
    );

    await client.deviceFilters.list({ viewScope: 'ALL' });
    expect(new URL(seenUrl).searchParams.get('viewScope')).toBe('ALL');
  });
});
