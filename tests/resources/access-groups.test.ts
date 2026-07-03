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

describe('AccessGroupsResource', () => {
  it('links() returns the access-group root links', async () => {
    const result = await client.accessGroups.links();
    expect(result._links?.accessGroups).toBeDefined();
  });

  it('list() returns access groups for an org unit', async () => {
    const page = await client.accessGroups.list(200);
    expect(page.data[0].groupName).toBe('Techs');
    expect(page.totalItems).toBe(1);
  });

  it('get() unwraps the access group envelope', async () => {
    const group = await client.accessGroups.get(10);
    expect(group.groupId).toBe(10);
    expect(group.deviceIds).toEqual([987654321]);
  });

  it('createDeviceGroup() POSTs to the device-access-groups endpoint', async () => {
    let seenBody: unknown;
    let seenPath = '';
    server.use(
      http.post(
        `${BASE_URL}/api/org-units/:orgUnitId/device-access-groups`,
        async ({ request }) => {
          seenPath = new URL(request.url).pathname;
          seenBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await client.accessGroups.createDeviceGroup(200, {
      groupName: 'Servers',
      groupDescription: 'Server access',
      deviceIds: ['987654321'],
    });

    expect(seenPath).toBe('/api/org-units/200/device-access-groups');
    expect(seenBody).toEqual({
      groupName: 'Servers',
      groupDescription: 'Server access',
      deviceIds: ['987654321'],
    });
  });

  it('createOrgUnitGroup() POSTs to the access-groups endpoint', async () => {
    let seenPath = '';
    server.use(
      http.post(`${BASE_URL}/api/org-units/:orgUnitId/access-groups`, ({ request }) => {
        seenPath = new URL(request.url).pathname;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await client.accessGroups.createOrgUnitGroup(100, {
      groupName: 'Region East',
      groupDescription: 'Eastern org units',
      orgUnitIds: ['200'],
    });

    expect(seenPath).toBe('/api/org-units/100/access-groups');
  });
});
