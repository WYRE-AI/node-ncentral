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

describe('OrgUnitsResource', () => {
  it('list() returns all org units', async () => {
    const page = await client.orgUnits.list();
    expect(page.data[0].orgUnitName).toBe('Acme Corp');
    expect(page.totalItems).toBe(1);
  });

  it('get() returns a single org unit', async () => {
    const result = await client.orgUnits.get(200);
    expect(result.orgUnitId).toBe('200');
    expect(result.orgUnitType).toBe('CUSTOMER');
  });

  it('children() lists child org units', async () => {
    const page = await client.orgUnits.children(100);
    expect(page.data).toHaveLength(1);
  });

  it('devices() lists devices under the org unit with filter support', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/org-units/:orgUnitId/devices`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json(fixtures.deviceList);
      }),
    );

    const page = await client.orgUnits.devices(200, { filterId: 7 });
    expect(page.data[0].deviceId).toBe(987654321);
    expect(new URL(seenUrl).searchParams.get('filterId')).toBe('7');
  });

  it('activeIssues() returns the paginated issue list', async () => {
    const page = await client.orgUnits.activeIssues(200);
    expect(page.data[0].serviceName).toBe('CPU');
    expect(page.pageNumber).toBe(1);
    expect(page.totalPages).toBe(1);
  });

  it('jobStatuses() returns the job status list', async () => {
    const page = await client.orgUnits.jobStatuses(200);
    expect(page.data[0].jobName).toBe('AV Definition Update');
  });

  it('registrationToken() unwraps the token envelope', async () => {
    const token = await client.orgUnits.registrationToken(200);
    expect(token.registrationToken).toBeDefined();
  });

  it('customProperties() lists org-unit custom properties', async () => {
    const page = await client.orgUnits.customProperties(200);
    expect(page.data[0].propertyName).toBe('Contract Tier');
  });

  it('getCustomProperty() returns one property', async () => {
    const prop = await client.orgUnits.getCustomProperty(200, 1001);
    expect(prop.value).toBe('Gold');
  });

  it('updateCustomProperty() PUTs the new value', async () => {
    let seenBody: unknown;
    server.use(
      http.put(
        `${BASE_URL}/api/org-units/:orgUnitId/custom-properties/:propertyId`,
        async ({ request }) => {
          seenBody = await request.json();
          return HttpResponse.json(fixtures.propertyUpdated);
        },
      ),
    );

    const result = await client.orgUnits.updateCustomProperty(200, 1001, 'Silver');
    expect(result._warnings).toEqual([]);
    expect(seenBody).toEqual({ value: 'Silver' });
  });

  it('updateDefaultCustomProperty() injects propertyId into the body', async () => {
    let seenBody: unknown;
    server.use(
      http.put(
        `${BASE_URL}/api/org-units/:orgUnitId/org-custom-property-defaults`,
        async ({ request }) => {
          seenBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await client.orgUnits.updateDefaultCustomProperty(200, 1001, {
      defaultValue: 'Gold',
      propagate: true,
    });

    expect(seenBody).toEqual({ propertyId: 1001, defaultValue: 'Gold', propagate: true });
  });

  it('getDeviceDefaultCustomProperty() unwraps the property envelope', async () => {
    const prop = await client.orgUnits.getDeviceDefaultCustomProperty(200, 2001);
    expect(prop.propertyName).toBe('Backup Policy');
    expect(prop.propertyLevel).toBe('CUSTOMER');
  });
});
