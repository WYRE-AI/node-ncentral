import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type {
  Customer,
  ServiceOrganization,
  ServiceOrganizationCreated,
  ServiceOrganizationCreation,
} from '../types/org-units.js';

/** Service organization endpoints. */
export class ServiceOrgsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/service-orgs` — lists all service organizations. */
  async list(params?: PaginationParams): Promise<PaginatedResponse<ServiceOrganization>> {
    const raw = await this.http.request<unknown>('/api/service-orgs', { params });
    return toPaginated<ServiceOrganization>(raw, params);
  }

  /** `GET /api/service-orgs/{soId}` — gets a service organization (PREVIEW). */
  async get(soId: number): Promise<ServiceOrganization> {
    const raw = await this.http.request<unknown>(`/api/service-orgs/${soId}`);
    return unwrap<ServiceOrganization>(raw);
  }

  /** `POST /api/service-orgs` — creates a service organization (PREVIEW). */
  async create(data: ServiceOrganizationCreation): Promise<ServiceOrganizationCreated> {
    const raw = await this.http.request<unknown>('/api/service-orgs', {
      method: 'POST',
      body: data,
    });
    return unwrap<ServiceOrganizationCreated>(raw);
  }

  /** `GET /api/service-orgs/{soId}/customers` — lists a service organization's customers (PREVIEW). */
  async customers(
    soId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Customer>> {
    const raw = await this.http.request<unknown>(`/api/service-orgs/${soId}/customers`, {
      params,
    });
    return toPaginated<Customer>(raw, params);
  }
}
