import { TokenManager } from './auth.js';
import { resolveConfig, type NCentralConfig } from './config.js';
import { HttpClient, type RequestOptions } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { AccessGroupsResource } from './resources/access-groups.js';
import { CustomersResource } from './resources/customers.js';
import { DeviceFiltersResource } from './resources/device-filters.js';
import { DevicesResource } from './resources/devices.js';
import { OrgUnitsResource } from './resources/org-units.js';
import { ScheduledTasksResource } from './resources/scheduled-tasks.js';
import { ServiceOrgsResource } from './resources/service-orgs.js';
import { SitesResource } from './resources/sites.js';
import { SystemResource } from './resources/system.js';

/**
 * Client for the N-able N-central REST API (API-Service).
 *
 * Token lifecycle is fully internal: the client lazily exchanges the
 * permanent User-API Token (JWT) for access/refresh tokens on the first
 * request, proactively refreshes before expiry, and transparently
 * re-authenticates once on an unexpected 401.
 *
 * ```ts
 * const client = new NCentralClient({
 *   serverUrl: 'https://ncentral.example.com',
 *   jwt: process.env.NCENTRAL_JWT!,
 * });
 * const devices = await client.devices.list({ pageSize: 100 });
 * ```
 */
export class NCentralClient {
  readonly system: SystemResource;
  readonly serviceOrgs: ServiceOrgsResource;
  readonly customers: CustomersResource;
  readonly sites: SitesResource;
  readonly orgUnits: OrgUnitsResource;
  readonly devices: DevicesResource;
  readonly deviceFilters: DeviceFiltersResource;
  readonly scheduledTasks: ScheduledTasksResource;
  readonly accessGroups: AccessGroupsResource;

  private readonly http: HttpClient;

  constructor(config: NCentralConfig) {
    const resolved = resolveConfig(config);

    const tokenManager = new TokenManager({
      serverUrl: resolved.serverUrl,
      jwt: resolved.jwt,
      timeoutMs: resolved.timeoutMs,
      fetchImpl: resolved.fetchImpl,
    });

    this.http = new HttpClient({
      serverUrl: resolved.serverUrl,
      timeoutMs: resolved.timeoutMs,
      maxRetries: resolved.maxRetries,
      retryDelayMs: resolved.retryDelayMs,
      tokenManager,
      rateLimiter: new RateLimiter(resolved.requestsPerSecond),
      fetchImpl: resolved.fetchImpl,
    });

    this.system = new SystemResource(this.http);
    this.serviceOrgs = new ServiceOrgsResource(this.http);
    this.customers = new CustomersResource(this.http);
    this.sites = new SitesResource(this.http);
    this.orgUnits = new OrgUnitsResource(this.http);
    this.devices = new DevicesResource(this.http);
    this.deviceFilters = new DeviceFiltersResource(this.http);
    this.scheduledTasks = new ScheduledTasksResource(this.http);
    this.accessGroups = new AccessGroupsResource(this.http);
  }

  /**
   * Performs a raw request against the N-central API using this client's
   * auth, rate limiting, retries and error mapping. Intended for callers
   * that need an endpoint or query parameter the typed resources don't
   * expose yet. `path` must start with `/api`.
   */
  async request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.http.request<T>(path, options);
  }
}
