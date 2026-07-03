import { http, HttpResponse } from 'msw';
import * as fixtures from '../fixtures/index.js';

/** Base URL used by every test client. */
export const BASE_URL = 'https://ncentral.test';

/** The JWT tests configure the client with. */
export const TEST_JWT = 'test-user-api-token-jwt';

function isAuthorized(request: Request): boolean {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer access-token-');
}

function unauthorized() {
  return HttpResponse.json(fixtures.errorResponse401, { status: 401 });
}

/**
 * Wraps a JSON handler with the standard access-token check so every
 * endpoint implicitly exercises the auth wiring.
 */
function authed(resolver: (info: { request: Request; params: Record<string, string | readonly string[]> }) => Response | Promise<Response>) {
  return async (info: { request: Request; params: Record<string, string | readonly string[]> }) => {
    if (!isAuthorized(info.request)) return unauthorized();
    return resolver(info);
  };
}

const json = (body: unknown, status = 200) => () => HttpResponse.json(body, { status });

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────
  http.post(`${BASE_URL}/api/auth/authenticate`, ({ request }) => {
    const header = request.headers.get('authorization');
    if (header !== `Bearer ${TEST_JWT}`) {
      return HttpResponse.json(fixtures.errorResponse401, { status: 401 });
    }
    return HttpResponse.json(fixtures.authenticateResponse);
  }),

  http.post(`${BASE_URL}/api/auth/refresh`, async ({ request }) => {
    const body = await request.text();
    if (body !== fixtures.REFRESH_TOKEN && body !== fixtures.REFRESHED_REFRESH_TOKEN) {
      return HttpResponse.json(fixtures.errorResponse401, { status: 401 });
    }
    return HttpResponse.json(fixtures.refreshResponse);
  }),

  http.get(`${BASE_URL}/api/auth/validate`, authed(json(fixtures.validateResponse))),

  // ── System ──────────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api`, authed(json(fixtures.apiLinks))),
  http.get(`${BASE_URL}/api/health`, authed(json(fixtures.health))),
  http.get(`${BASE_URL}/api/server-info`, authed(json(fixtures.serverInfo))),
  http.get(`${BASE_URL}/api/server-info/extra`, authed(json(fixtures.serverInfoExtra))),

  // ── Service organizations ───────────────────────────────────────────
  http.get(`${BASE_URL}/api/service-orgs`, authed(json(fixtures.serviceOrganizationList))),
  http.post(
    `${BASE_URL}/api/service-orgs`,
    authed(json(fixtures.serviceOrganizationCreated, 201)),
  ),
  http.get(`${BASE_URL}/api/service-orgs/:soId`, authed(json(fixtures.serviceOrganization))),
  http.get(`${BASE_URL}/api/service-orgs/:soId/customers`, authed(json(fixtures.customerList))),
  http.post(
    `${BASE_URL}/api/service-orgs/:soId/customers`,
    authed(json(fixtures.customerCreated, 201)),
  ),

  // ── Customers ────────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/customers`, authed(json(fixtures.customerList))),
  http.get(`${BASE_URL}/api/customers/:customerId`, authed(json(fixtures.customer))),
  http.get(`${BASE_URL}/api/customers/:customerId/sites`, authed(json(fixtures.siteList))),
  http.post(
    `${BASE_URL}/api/customers/:customerId/sites`,
    authed(json(fixtures.siteCreated, 201)),
  ),
  http.get(
    `${BASE_URL}/api/customers/:customerId/registration-token`,
    authed(json(fixtures.registrationTokenResponse)),
  ),

  // ── Sites ────────────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/sites`, authed(json(fixtures.siteList))),
  http.get(`${BASE_URL}/api/sites/:siteId`, authed(json(fixtures.site))),
  http.get(
    `${BASE_URL}/api/sites/:siteId/registration-token`,
    authed(json(fixtures.registrationTokenResponse)),
  ),

  // ── Org units ────────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/org-units`, authed(json(fixtures.organizationUnitList))),
  http.get(`${BASE_URL}/api/org-units/:orgUnitId`, authed(json(fixtures.organizationUnit))),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/children`,
    authed(json(fixtures.organizationUnitList)),
  ),
  http.get(`${BASE_URL}/api/org-units/:orgUnitId/devices`, authed(json(fixtures.deviceList))),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/active-issues`,
    authed(json(fixtures.activeIssues)),
  ),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/job-statuses`,
    authed(json(fixtures.jobStatuses)),
  ),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/registration-token`,
    authed(json(fixtures.registrationTokenResponse)),
  ),
  // NOTE: registered before the parameterized custom property route so the
  // longer literal path wins.
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/custom-properties/device-custom-property-defaults/:propertyId`,
    authed(json(fixtures.deviceDefaultCustomProperty)),
  ),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/custom-properties`,
    authed(json(fixtures.orgUnitCustomProperties)),
  ),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/custom-properties/:propertyId`,
    authed(json(fixtures.orgUnitCustomProperty)),
  ),
  http.put(
    `${BASE_URL}/api/org-units/:orgUnitId/custom-properties/:propertyId`,
    authed(json(fixtures.propertyUpdated)),
  ),
  http.put(
    `${BASE_URL}/api/org-units/:orgUnitId/org-custom-property-defaults`,
    authed(() => new HttpResponse(null, { status: 204 })),
  ),

  // ── Devices ──────────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/devices`, authed(json(fixtures.deviceList))),
  http.post(
    `${BASE_URL}/api/devices/maintenance-windows`,
    authed(json(fixtures.maintenanceWindowResult)),
  ),
  http.delete(
    `${BASE_URL}/api/devices/maintenance-windows`,
    authed(json(fixtures.maintenanceWindowResult)),
  ),
  http.get(`${BASE_URL}/api/devices/:deviceId`, authed(json(fixtures.deviceResponse))),
  http.get(`${BASE_URL}/api/devices/:deviceId/assets`, authed(json(fixtures.deviceAssets))),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/assets/lifecycle-info`,
    authed(json(fixtures.lifecycleInfo)),
  ),
  http.put(
    `${BASE_URL}/api/devices/:deviceId/assets/lifecycle-info`,
    authed(() => new HttpResponse(null, { status: 204 })),
  ),
  http.patch(
    `${BASE_URL}/api/devices/:deviceId/assets/lifecycle-info`,
    authed(() => new HttpResponse(null, { status: 204 })),
  ),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/service-monitor-status`,
    authed(json(fixtures.serviceMonitorStatus)),
  ),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/scheduled-tasks`,
    authed(json(fixtures.deviceTasks)),
  ),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/maintenance-windows`,
    authed(json(fixtures.maintenanceWindows)),
  ),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/custom-properties`,
    authed(json(fixtures.deviceCustomProperties)),
  ),
  http.get(
    `${BASE_URL}/api/devices/:deviceId/custom-properties/:propertyId`,
    authed(json(fixtures.deviceCustomProperty)),
  ),
  http.put(
    `${BASE_URL}/api/devices/:deviceId/custom-properties/:propertyId`,
    authed(json(fixtures.propertyUpdated)),
  ),

  // ── Device filters ───────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/device-filters`, authed(json(fixtures.deviceFilterList))),

  // ── Scheduled tasks ──────────────────────────────────────────────────
  http.post(
    `${BASE_URL}/api/scheduled-tasks/direct`,
    authed(json(fixtures.taskCreated, 201)),
  ),
  http.get(`${BASE_URL}/api/scheduled-tasks/:taskId`, authed(json(fixtures.taskInfo))),
  http.get(
    `${BASE_URL}/api/scheduled-tasks/:taskId/status`,
    authed(json(fixtures.taskStatus)),
  ),
  http.get(
    `${BASE_URL}/api/scheduled-tasks/:taskId/status/details`,
    authed(json(fixtures.taskStatusDetails)),
  ),
  http.get(
    `${BASE_URL}/api/appliance-tasks/:taskId`,
    authed(json(fixtures.applianceTaskInfo)),
  ),

  // ── Access groups ────────────────────────────────────────────────────
  http.get(`${BASE_URL}/api/access-groups`, authed(json(fixtures.accessGroupLinks))),
  http.get(
    `${BASE_URL}/api/access-groups/:accessGroupId`,
    authed(json(fixtures.accessGroupDetails)),
  ),
  http.get(
    `${BASE_URL}/api/org-units/:orgUnitId/access-groups`,
    authed(json(fixtures.accessGroupList)),
  ),
  http.post(
    `${BASE_URL}/api/org-units/:orgUnitId/access-groups`,
    authed(() => new HttpResponse(null, { status: 204 })),
  ),
  http.post(
    `${BASE_URL}/api/org-units/:orgUnitId/device-access-groups`,
    authed(() => new HttpResponse(null, { status: 204 })),
  ),
];
