import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type {
  AccessGroup,
  AccessGroupDetails,
  DeviceAccessGroupCreateRequest,
  OrgUnitAccessGroupCreateRequest,
} from '../types/access-groups.js';
import type { LinksResponse } from '../types/common.js';

/** Access-group endpoints (all PREVIEW). */
export class AccessGroupsResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/access-groups` — links to access-group related endpoints. */
  async links(): Promise<LinksResponse> {
    return this.http.request<LinksResponse>('/api/access-groups');
  }

  /** `GET /api/org-units/{orgUnitId}/access-groups` — lists access groups for an org unit. */
  async list(
    orgUnitId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<AccessGroup>> {
    const raw = await this.http.request<unknown>(`/api/org-units/${orgUnitId}/access-groups`, {
      params,
    });
    return toPaginated<AccessGroup>(raw, params);
  }

  /** `GET /api/access-groups/{accessGroupId}` — gets an access group. */
  async get(accessGroupId: number): Promise<AccessGroupDetails> {
    const raw = await this.http.request<unknown>(`/api/access-groups/${accessGroupId}`);
    return unwrap<AccessGroupDetails>(raw);
  }

  /**
   * `POST /api/org-units/{orgUnitId}/device-access-groups` — creates a
   * device access group under an org unit.
   */
  async createDeviceGroup(
    orgUnitId: number,
    data: DeviceAccessGroupCreateRequest,
  ): Promise<void> {
    await this.http.request<void>(`/api/org-units/${orgUnitId}/device-access-groups`, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * `POST /api/org-units/{orgUnitId}/access-groups` — creates an org-unit
   * access group under an org unit.
   */
  async createOrgUnitGroup(
    orgUnitId: number,
    data: OrgUnitAccessGroupCreateRequest,
  ): Promise<void> {
    await this.http.request<void>(`/api/org-units/${orgUnitId}/access-groups`, {
      method: 'POST',
      body: data,
    });
  }
}
