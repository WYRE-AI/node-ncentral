import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type { RegistrationToken } from '../types/common.js';
import type { Site, SiteCreated, SiteCreation } from '../types/org-units.js';

/** Site org-unit endpoints. */
export class SitesResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/sites` — lists all sites. */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Site>> {
    const raw = await this.http.request<unknown>('/api/sites', { params });
    return toPaginated<Site>(raw, params);
  }

  /** `GET /api/sites/{siteId}` — gets a site (PREVIEW). */
  async get(siteId: number): Promise<Site> {
    const raw = await this.http.request<unknown>(`/api/sites/${siteId}`);
    return unwrap<Site>(raw);
  }

  /** `POST /api/customers/{customerId}/sites` — creates a site under a customer (PREVIEW). */
  async create(customerId: number, data: SiteCreation): Promise<SiteCreated> {
    const raw = await this.http.request<unknown>(`/api/customers/${customerId}/sites`, {
      method: 'POST',
      body: data,
    });
    return unwrap<SiteCreated>(raw);
  }

  /** `GET /api/sites/{siteId}/registration-token` — gets the registration token (PREVIEW). */
  async registrationToken(siteId: number): Promise<RegistrationToken> {
    const raw = await this.http.request<unknown>(`/api/sites/${siteId}/registration-token`);
    return unwrap<RegistrationToken>(raw);
  }
}
