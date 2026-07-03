import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type { RegistrationToken } from '../types/common.js';
import type { Device, DeviceListParams } from '../types/devices.js';
import type { ActiveIssue, JobStatus } from '../types/monitoring.js';
import type {
  DefaultCustomPropertyUpdate,
  DefaultDeviceCustomProperty,
  OrganizationCustomProperty,
  OrganizationPropertyUpdated,
  OrganizationUnit,
} from '../types/org-units.js';

/** Generic org-unit endpoints (any of SO / customer / site). */
export class OrgUnitsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/org-units` — lists all org units. */
  async list(params?: PaginationParams): Promise<PaginatedResponse<OrganizationUnit>> {
    const raw = await this.http.request<unknown>('/api/org-units', { params });
    return toPaginated<OrganizationUnit>(raw, params);
  }

  /** `GET /api/org-units/{orgUnitId}` — gets an org unit (PREVIEW). */
  async get(orgUnitId: number): Promise<OrganizationUnit> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}`);
    return unwrap<OrganizationUnit>(raw);
  }

  /** `GET /api/org-units/{orgUnitId}/children` — lists child org units (PREVIEW). */
  async children(
    orgUnitId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<OrganizationUnit>> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}/children`, {
      params,
    });
    return toPaginated<OrganizationUnit>(raw, params);
  }

  /** `GET /api/org-units/{orgUnitId}/devices` — lists devices under an org unit (PREVIEW). */
  async devices(
    orgUnitId: number,
    params?: DeviceListParams,
  ): Promise<PaginatedResponse<Device>> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}/devices`, {
      params,
    });
    return toPaginated<Device>(raw, params);
  }

  /**
   * `GET /api/org-units/{orgUnitId}/active-issues` — lists active issues
   * (PREVIEW; customers/sites only).
   */
  async activeIssues(
    orgUnitId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<ActiveIssue>> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}/active-issues`, {
      params,
    });
    return toPaginated<ActiveIssue>(raw, params);
  }

  /** `GET /api/org-units/{orgUnitId}/job-statuses` — lists job statuses (PREVIEW). */
  async jobStatuses(
    orgUnitId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<JobStatus>> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}/job-statuses`, {
      params,
    });
    return toPaginated<JobStatus>(raw, params);
  }

  /** `GET /api/org-units/{orgUnitId}/registration-token` — gets the registration token (PREVIEW). */
  async registrationToken(orgUnitId: number): Promise<RegistrationToken> {
    const raw = await this.http.request<unknown>(
      `/api/org-units/${orgUnitId}/registration-token`,
    );
    return unwrap<RegistrationToken>(raw);
  }

  /** `GET /api/org-units/{orgUnitId}/custom-properties` — lists org-unit custom properties. */
  async customProperties(
    orgUnitId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<OrganizationCustomProperty>> {
    const raw = await this.http.request<unknown>(
      `/api/org-units/${orgUnitId}/custom-properties`,
      { params },
    );
    return toPaginated<OrganizationCustomProperty>(raw, params);
  }

  /** `GET /api/org-units/{orgUnitId}/custom-properties/{propertyId}` — gets one custom property. */
  async getCustomProperty(
    orgUnitId: number,
    propertyId: number,
  ): Promise<OrganizationCustomProperty> {
    const raw = await this.http.request<unknown>(
      `/api/org-units/${orgUnitId}/custom-properties/${propertyId}`,
    );
    return unwrap<OrganizationCustomProperty>(raw);
  }

  /**
   * `PUT /api/org-units/{orgUnitId}/custom-properties/{propertyId}` —
   * updates the value of an org-unit custom property.
   */
  async updateCustomProperty(
    orgUnitId: number,
    propertyId: number,
    value: string,
  ): Promise<OrganizationPropertyUpdated> {
    return this.http.request<OrganizationPropertyUpdated>(
      `/api/org-units/${orgUnitId}/custom-properties/${propertyId}`,
      { method: 'PUT', body: { value } },
    );
  }

  /**
   * `PUT /api/org-units/{orgUnitId}/org-custom-property-defaults` —
   * modifies a default org-unit custom property. The target `propertyId`
   * travels in the request body (not the path) on this endpoint.
   */
  async updateDefaultCustomProperty(
    orgUnitId: number,
    propertyId: number,
    data: DefaultCustomPropertyUpdate,
  ): Promise<void> {
    await this.http.request<void>(`/api/org-units/${orgUnitId}/org-custom-property-defaults`, {
      method: 'PUT',
      body: { propertyId, ...data },
    });
  }

  /**
   * `GET /api/org-units/{orgUnitId}/custom-properties/device-custom-property-defaults/{propertyId}`
   * — gets a device custom-property default.
   */
  async getDeviceDefaultCustomProperty(
    orgUnitId: number,
    propertyId: number,
  ): Promise<DefaultDeviceCustomProperty> {
    const raw = await this.http.request<unknown>(
      `/api/org-units/${orgUnitId}/custom-properties/device-custom-property-defaults/${propertyId}`,
    );
    return unwrap<DefaultDeviceCustomProperty>(raw);
  }
}
