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

describe('DevicesResource', () => {
  it('list() returns the paginated device envelope', async () => {
    const page = await client.devices.list();
    expect(page.data[0].longName).toBe('ACME-DC01');
    expect(page.pageNumber).toBe(1);
    expect(page.pageSize).toBe(50);
    expect(page.totalItems).toBe(1);
    expect(page._links?.firstPage).toContain('/api/devices');
  });

  it('list() forwards the saved-filter id', async () => {
    let seenUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/devices`, ({ request }) => {
        seenUrl = request.url;
        return HttpResponse.json(fixtures.deviceList);
      }),
    );

    await client.devices.list({ filterId: 42 });
    expect(new URL(seenUrl).searchParams.get('filterId')).toBe('42');
  });

  it('get() unwraps the DeviceResponse envelope', async () => {
    const result = await client.devices.get(987654321);
    expect(result.deviceId).toBe(987654321);
    expect(result.customerName).toBe('Acme Corp');
  });

  it('assets() unwraps the asset-info envelope', async () => {
    const assets = await client.devices.assets(987654321);
    expect(assets.os).toEqual(fixtures.deviceAssets.data.os);
  });

  it('lifecycleInfo() returns warranty details', async () => {
    const info = await client.devices.lifecycleInfo(987654321);
    expect(info.warrantyExpiryDate).toBe('2027-01-15');
    expect(info.cost).toBe(4200.5);
  });

  it('updateLifecycleInfo() PATCHes partial updates', async () => {
    let seenMethod = '';
    let seenBody: unknown;
    server.use(
      http.patch(
        `${BASE_URL}/api/devices/:deviceId/assets/lifecycle-info`,
        async ({ request }) => {
          seenMethod = request.method;
          seenBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await client.devices.updateLifecycleInfo(987654321, { assetTag: 'ACME-0043' });
    expect(seenMethod).toBe('PATCH');
    expect(seenBody).toEqual({ assetTag: 'ACME-0043' });
  });

  it('replaceLifecycleInfo() PUTs a full replacement', async () => {
    let seenMethod = '';
    server.use(
      http.put(`${BASE_URL}/api/devices/:deviceId/assets/lifecycle-info`, ({ request }) => {
        seenMethod = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await client.devices.replaceLifecycleInfo(987654321, fixtures.lifecycleInfo);
    expect(seenMethod).toBe('PUT');
  });

  it('serviceMonitorStatus() returns monitored service statuses', async () => {
    const page = await client.devices.serviceMonitorStatus(987654321);
    expect(page.data[0].moduleName).toBe('CPU');
    expect(page.data[0].stateStatus).toBe('Normal');
  });

  it('tasks() lists tasks associated with the device', async () => {
    const page = await client.devices.tasks(987654321);
    expect(page.data[0].taskName).toBe('Disk Cleanup');
  });

  it('maintenanceWindows() lists the device maintenance windows', async () => {
    const page = await client.devices.maintenanceWindows(987654321);
    expect(page.data[0].name).toBe('Patch Tuesday');
    expect(page.data[0].scheduleID).toBe(777);
  });

  it('addMaintenanceWindows() POSTs deviceIDs and windows', async () => {
    let seenBody: unknown;
    server.use(
      http.post(`${BASE_URL}/api/devices/maintenance-windows`, async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json(fixtures.maintenanceWindowResult);
      }),
    );

    const window = {
      applicableAction: [{ type: 'patch', actions: [{ Key: 'patch', Value: 'install' }] }],
      cron: '0 0 3 ? * WED',
      duration: 120,
      enabled: true,
      name: 'Patch Tuesday',
      type: 'action',
    };
    const result = await client.devices.addMaintenanceWindows([987654321], [window]);

    expect(result.success).toBe(true);
    expect(seenBody).toEqual({ deviceIDs: [987654321], maintenanceWindows: [window] });
  });

  it('deleteMaintenanceWindows() DELETEs by scheduleIds', async () => {
    let seenBody: unknown;
    let seenMethod = '';
    server.use(
      http.delete(`${BASE_URL}/api/devices/maintenance-windows`, async ({ request }) => {
        seenMethod = request.method;
        seenBody = await request.json();
        return HttpResponse.json(fixtures.maintenanceWindowResult);
      }),
    );

    const result = await client.devices.deleteMaintenanceWindows([777]);
    expect(result.success).toBe(true);
    expect(seenMethod).toBe('DELETE');
    expect(seenBody).toEqual({ scheduleIds: [777] });
  });

  it('customProperties() lists device custom properties', async () => {
    const page = await client.devices.customProperties(987654321);
    expect(page.data[0].propertyName).toBe('Patch Ring');
  });

  it('getCustomProperty() returns one device property', async () => {
    const prop = await client.devices.getCustomProperty(987654321, 3001);
    expect(prop.value).toBe('Ring 1');
  });

  it('updateCustomProperty() PUTs the new value', async () => {
    let seenBody: unknown;
    server.use(
      http.put(
        `${BASE_URL}/api/devices/:deviceId/custom-properties/:propertyId`,
        async ({ request }) => {
          seenBody = await request.json();
          return HttpResponse.json(fixtures.propertyUpdated);
        },
      ),
    );

    const result = await client.devices.updateCustomProperty(987654321, 3001, 'Ring 2');
    expect(result._warnings).toEqual([]);
    expect(seenBody).toEqual({ value: 'Ring 2' });
  });
});
