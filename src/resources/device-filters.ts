import type { HttpClient } from '../http.js';
import { toPaginated, type PaginatedResponse } from '../pagination.js';
import type { DeviceFilter, DeviceFilterListParams } from '../types/devices.js';

/** Saved device-filter endpoints. */
export class DeviceFiltersResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/device-filters` — lists saved device filters (PREVIEW). */
  async list(params?: DeviceFilterListParams): Promise<PaginatedResponse<DeviceFilter>> {
    const raw = await this.http.request<unknown>('/api/device-filters', { params });
    return toPaginated<DeviceFilter>(raw, params);
  }
}
