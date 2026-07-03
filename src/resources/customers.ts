import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type { RegistrationToken } from '../types/common.js';
import type { Customer, CustomerCreation, Site } from '../types/org-units.js';

/** Customer org-unit endpoints. */
export class CustomersResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/customers` — lists all customers. */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const raw = await this.http.request<unknown>('/api/customers', { params });
    return toPaginated<Customer>(raw, params);
  }

  /** `GET /api/customers/{customerId}` — gets a customer (PREVIEW). */
  async get(customerId: number): Promise<Customer> {
    const raw = await this.http.request<unknown>(`/api/customers/${customerId}`);
    return unwrap<Customer>(raw);
  }

  /**
   * `POST /api/service-orgs/{soId}/customers` — creates a customer under a
   * service organization (PREVIEW). The API echoes the created customer.
   */
  async create(soId: number, data: CustomerCreation): Promise<CustomerCreation> {
    const raw = await this.http.request<unknown>(`/api/service-orgs/${soId}/customers`, {
      method: 'POST',
      body: data,
    });
    return unwrap<CustomerCreation>(raw);
  }

  /** `GET /api/customers/{customerId}/sites` — lists a customer's sites (PREVIEW). */
  async sites(customerId: number, params?: PaginationParams): Promise<PaginatedResponse<Site>> {
    const raw = await this.http.request<unknown>(`/api/customers/${customerId}/sites`, {
      params,
    });
    return toPaginated<Site>(raw, params);
  }

  /** `GET /api/customers/{customerId}/registration-token` — gets the registration token (PREVIEW). */
  async registrationToken(customerId: number): Promise<RegistrationToken> {
    const raw = await this.http.request<unknown>(
      `/api/customers/${customerId}/registration-token`,
    );
    return unwrap<RegistrationToken>(raw);
  }
}
