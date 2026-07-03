# node-ncentral

Node.js/TypeScript client library for the [N-able N-central](https://www.n-able.com/products/n-central) REST API (API-Service).

## Features

- **Zero runtime dependencies** — native `fetch` only
- **Fully managed token lifecycle** — lazily exchanges your permanent User-API Token (JWT) for access/refresh tokens, proactively refreshes 60 s before expiry, and transparently re-authenticates once on an unexpected 401. You never touch a token.
- **Typed resources** for every stable API-Service domain: org units (service organizations, customers, sites), devices, asset/lifecycle info, active issues, job statuses, scheduled tasks, custom properties, maintenance windows, device filters and access groups
- **Consistent pagination envelope** (`data`, `pageNumber`, `pageSize`, `totalItems`, `_links`, ...) across all list endpoints
- **Client-side rate limiting** (token bucket, default 10 req/s) plus automatic retry with exponential backoff on HTTP 429/5xx
- **Typed error hierarchy** (`AuthenticationError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `RateLimitError`, `ServerError`)
- Dual **CJS + ESM** builds with full type declarations

## Installation

The package is published to **GitHub Packages**, not npmjs.org. Point the `@wyre-technology` scope at the GitHub registry first:

```bash
# .npmrc (project or user level)
@wyre-technology:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` must be a GitHub token with `read:packages` scope (any authenticated token works for public packages).

```bash
npm install @wyre-technology/node-ncentral
```

Requires Node.js ≥ 20.

## Quick start

```typescript
import { NCentralClient } from '@wyre-technology/node-ncentral';

const client = new NCentralClient({
  serverUrl: 'https://ncentral.example.com', // your N-central server
  jwt: process.env.NCENTRAL_JWT!,            // User-API Token (JWT)
});

// List devices (paginated)
const page = await client.devices.list({ pageSize: 100, sortBy: 'longName' });
for (const device of page.data) {
  console.log(device.deviceId, device.longName, device.customerName);
}

// Get a single device and its asset info
const device = await client.devices.get(987654321);
const assets = await client.devices.assets(987654321);

// List all customers
const customers = await client.customers.list();

// Active issues for an org unit
const issues = await client.orgUnits.activeIssues(200, { pageSize: 50 });
```

## Authentication

N-central's API-Service uses a two-step token flow, which this client handles entirely for you:

1. **Generate a User-API Token (JWT)** in the N-central UI: *Administration → User Management → Users → click your API user → API Access → Generate JSON Web Token*. The user must have appropriate roles/access groups and MFA/2FA disabled. This JWT is the permanent credential you pass as `jwt`.
2. On the first request the client calls `POST /api/auth/authenticate` (JWT as bearer) to obtain an **access token** (expires in 1 h) and a **refresh token** (expires in 25 h).
3. Every API call carries the access token. The client proactively refreshes via `POST /api/auth/refresh` 60 seconds before the access token expires, and falls back to a full re-authentication if the refresh fails.
4. If an API call still returns 401 (e.g. tokens revoked server-side), the client forces one re-authentication and retries the request exactly once before surfacing an `AuthenticationError`.

## Configuration

```typescript
const client = new NCentralClient({
  serverUrl: 'https://ncentral.example.com', // required; trailing slash tolerated
  jwt: '...',                                // required; User-API Token (JWT)
  timeoutMs: 30_000,                         // per-request timeout (default 30 s)
  maxRetries: 3,                             // retries for 429/5xx (default 3)
  requestsPerSecond: 10,                     // client-side rate limit (default 10)
});
```

### On-prem servers

N-central is installed per-organization, so the base URL is always **your** server's FQDN — there is no shared cloud endpoint. `http://` is accepted for lab servers, but production servers should always use `https://`.

If your server uses a certificate from a **private CA or a self-signed certificate**, make the CA certificate available to Node.js with [`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#node_extra_ca_certsfile):

```bash
NODE_EXTRA_CA_CERTS=/path/to/your-ca.pem node app.js
```

Never disable TLS verification (`NODE_TLS_REJECT_UNAUTHORIZED=0`) — it silently disables certificate checking for *every* connection the process makes.

## API reference

All list methods accept optional `{ pageNumber?, pageSize?, sortBy?, sortOrder?, select? }` parameters and resolve to `PaginatedResponse<T>`. Methods marked *(PREVIEW)* wrap endpoints N-able currently flags as preview.

| Resource | Method | Endpoint |
|---|---|---|
| `system` | `links()` | `GET /api` |
| | `health()` | `GET /api/health` |
| | `serverInfo()` | `GET /api/server-info` |
| | `serverInfoExtra()` *(PREVIEW)* | `GET /api/server-info/extra` |
| | `validateToken()` | `GET /api/auth/validate` |
| `serviceOrgs` | `list(params?)` | `GET /api/service-orgs` |
| | `get(soId)` *(PREVIEW)* | `GET /api/service-orgs/{soId}` |
| | `create(data)` *(PREVIEW)* | `POST /api/service-orgs` |
| | `customers(soId, params?)` *(PREVIEW)* | `GET /api/service-orgs/{soId}/customers` |
| `customers` | `list(params?)` | `GET /api/customers` |
| | `get(customerId)` *(PREVIEW)* | `GET /api/customers/{customerId}` |
| | `create(soId, data)` *(PREVIEW)* | `POST /api/service-orgs/{soId}/customers` |
| | `sites(customerId, params?)` *(PREVIEW)* | `GET /api/customers/{customerId}/sites` |
| | `registrationToken(customerId)` *(PREVIEW)* | `GET /api/customers/{customerId}/registration-token` |
| `sites` | `list(params?)` | `GET /api/sites` |
| | `get(siteId)` *(PREVIEW)* | `GET /api/sites/{siteId}` |
| | `create(customerId, data)` *(PREVIEW)* | `POST /api/customers/{customerId}/sites` |
| | `registrationToken(siteId)` *(PREVIEW)* | `GET /api/sites/{siteId}/registration-token` |
| `orgUnits` | `list(params?)` | `GET /api/org-units` |
| | `get(orgUnitId)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}` |
| | `children(orgUnitId, params?)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/children` |
| | `devices(orgUnitId, params?)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/devices` |
| | `activeIssues(orgUnitId, params?)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/active-issues` |
| | `jobStatuses(orgUnitId, params?)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/job-statuses` |
| | `registrationToken(orgUnitId)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/registration-token` |
| | `customProperties(orgUnitId, params?)` | `GET /api/org-units/{orgUnitId}/custom-properties` |
| | `getCustomProperty(orgUnitId, propertyId)` | `GET /api/org-units/{orgUnitId}/custom-properties/{propertyId}` |
| | `updateCustomProperty(orgUnitId, propertyId, value)` | `PUT /api/org-units/{orgUnitId}/custom-properties/{propertyId}` |
| | `updateDefaultCustomProperty(orgUnitId, propertyId, data)` | `PUT /api/org-units/{orgUnitId}/org-custom-property-defaults` |
| | `getDeviceDefaultCustomProperty(orgUnitId, propertyId)` | `GET /api/org-units/{orgUnitId}/custom-properties/device-custom-property-defaults/{propertyId}` |
| `devices` | `list(params?)` | `GET /api/devices` (supports `filterId`) |
| | `get(deviceId)` | `GET /api/devices/{deviceId}` |
| | `assets(deviceId)` | `GET /api/devices/{deviceId}/assets` |
| | `lifecycleInfo(deviceId)` | `GET /api/devices/{deviceId}/assets/lifecycle-info` |
| | `updateLifecycleInfo(deviceId, data)` | `PATCH /api/devices/{deviceId}/assets/lifecycle-info` |
| | `replaceLifecycleInfo(deviceId, data)` | `PUT /api/devices/{deviceId}/assets/lifecycle-info` |
| | `serviceMonitorStatus(deviceId)` *(PREVIEW)* | `GET /api/devices/{deviceId}/service-monitor-status` |
| | `tasks(deviceId, params?)` | `GET /api/devices/{deviceId}/scheduled-tasks` |
| | `maintenanceWindows(deviceId)` | `GET /api/devices/{deviceId}/maintenance-windows` |
| | `addMaintenanceWindows(deviceIds, windows)` | `POST /api/devices/maintenance-windows` |
| | `deleteMaintenanceWindows(scheduleIds)` ⚠ irreversible | `DELETE /api/devices/maintenance-windows` |
| | `customProperties(deviceId, params?)` | `GET /api/devices/{deviceId}/custom-properties` |
| | `getCustomProperty(deviceId, propertyId)` | `GET /api/devices/{deviceId}/custom-properties/{propertyId}` |
| | `updateCustomProperty(deviceId, propertyId, value)` | `PUT /api/devices/{deviceId}/custom-properties/{propertyId}` |
| `deviceFilters` | `list(params?)` *(PREVIEW)* | `GET /api/device-filters` (supports `viewScope`) |
| `scheduledTasks` | `createDirect(data)` ⚠ executes immediately | `POST /api/scheduled-tasks/direct` |
| | `get(taskId)` | `GET /api/scheduled-tasks/{taskId}` |
| | `status(taskId)` | `GET /api/scheduled-tasks/{taskId}/status` |
| | `statusDetails(taskId, params?)` | `GET /api/scheduled-tasks/{taskId}/status/details` |
| | `applianceTaskInfo(taskId)` *(PREVIEW)* | `GET /api/appliance-tasks/{taskId}` |
| `accessGroups` | `links()` *(PREVIEW)* | `GET /api/access-groups` |
| | `list(orgUnitId, params?)` *(PREVIEW)* | `GET /api/org-units/{orgUnitId}/access-groups` |
| | `get(accessGroupId)` *(PREVIEW)* | `GET /api/access-groups/{accessGroupId}` |
| | `createDeviceGroup(orgUnitId, data)` *(PREVIEW)* | `POST /api/org-units/{orgUnitId}/device-access-groups` |
| | `createOrgUnitGroup(orgUnitId, data)` *(PREVIEW)* | `POST /api/org-units/{orgUnitId}/access-groups` |

For endpoints not covered by a typed resource, `client.request<T>(path, options)` performs a raw request with the same auth, rate limiting, retries and error mapping.

## Pagination

List responses share one envelope:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pageNumber: number;   // 1-based
  pageSize: number;
  itemCount?: number;
  totalItems?: number;
  totalPages?: number;
  _links?: { firstPage?: string; previousPage?: string; nextPage?: string; lastPage?: string };
  _warning?: string;
}
```

```typescript
// Walk all pages
let pageNumber = 1;
for (;;) {
  const page = await client.devices.list({ pageNumber, pageSize: 500 });
  process(page.data);
  if (!page.totalPages || pageNumber >= page.totalPages || page.data.length === 0) break;
  pageNumber++;
}
```

## Error handling

Every failure derives from `NCentralError`, which carries `statusCode` and the parsed response body:

```typescript
import {
  NCentralError,
  AuthenticationError, // 401 — JWT/token rejected
  ForbiddenError,      // 403 — insufficient permissions
  NotFoundError,       // 404 — entity does not exist
  ValidationError,     // 400/422 — carries .errors: { field, message }[]
  RateLimitError,      // 429 — carries .retryAfter (seconds)
  ServerError,         // 5xx
} from '@wyre-technology/node-ncentral';

try {
  await client.devices.get(1);
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('No such device');
  } else if (err instanceof RateLimitError) {
    console.log(`Rate limited; retry in ${err.retryAfter}s`);
  } else if (err instanceof NCentralError) {
    console.error(err.statusCode, err.message, err.response);
  }
}
```

HTTP 429 and 5xx responses are retried automatically (with `Retry-After` support and exponential backoff) up to `maxRetries` before the error is thrown.

## Development

```bash
npm install
npm run lint    # tsc --noEmit
npm run build   # tsup (CJS + ESM + d.ts)
npm test        # vitest + MSW
```

## License

[Apache-2.0](./LICENSE)
