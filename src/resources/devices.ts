import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type {
  AssetLifecycleDetails,
  AssetLifecyclePatchRequest,
  AssetLifecyclePutRequest,
  Device,
  DeviceAssetInfo,
  DeviceCustomProperty,
  DeviceListParams,
  DevicePropertyUpdated,
  DeviceServiceMonitoringStatus,
  MaintenanceWindow,
  MaintenanceWindowRequest,
  MaintenanceWindowResponse,
} from '../types/devices.js';
import type { TaskStatusSummary } from '../types/tasks.js';

/** Device endpoints (inventory, assets, monitoring, maintenance, properties). */
export class DevicesResource {
  constructor(private readonly http: HttpClient) {}

  /** `GET /api/devices` — lists devices (supports saved-filter `filterId`). */
  async list(params?: DeviceListParams): Promise<PaginatedResponse<Device>> {
    const raw = await this.http.request<unknown>('/api/devices', { params });
    return toPaginated<Device>(raw, params);
  }

  /** `GET /api/devices/{deviceId}` — gets a device. */
  async get(deviceId: number): Promise<Device> {
    const raw = await this.http.request<unknown>(`/api/devices/${deviceId}`);
    return unwrap<Device>(raw);
  }

  /** `GET /api/devices/{deviceId}/assets` — gets the device's asset information. */
  async assets(deviceId: number): Promise<DeviceAssetInfo> {
    const raw = await this.http.request<unknown>(`/api/devices/${deviceId}/assets`);
    return unwrap<DeviceAssetInfo>(raw);
  }

  /** `GET /api/devices/{deviceId}/assets/lifecycle-info` — gets warranty/lifecycle info. */
  async lifecycleInfo(deviceId: number): Promise<AssetLifecycleDetails> {
    const raw = await this.http.request<unknown>(
      `/api/devices/${deviceId}/assets/lifecycle-info`,
    );
    return unwrap<AssetLifecycleDetails>(raw);
  }

  /**
   * `PATCH /api/devices/{deviceId}/assets/lifecycle-info` — partially
   * updates the device's lifecycle info (only the provided fields change).
   */
  async updateLifecycleInfo(deviceId: number, data: AssetLifecyclePatchRequest): Promise<void> {
    await this.http.request<void>(`/api/devices/${deviceId}/assets/lifecycle-info`, {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * `PUT /api/devices/{deviceId}/assets/lifecycle-info` — fully replaces
   * the device's lifecycle info (omitted fields are cleared).
   */
  async replaceLifecycleInfo(deviceId: number, data: AssetLifecyclePutRequest): Promise<void> {
    await this.http.request<void>(`/api/devices/${deviceId}/assets/lifecycle-info`, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * `GET /api/devices/{deviceId}/service-monitor-status` — status of the
   * services monitored on the device (PREVIEW).
   */
  async serviceMonitorStatus(
    deviceId: number,
  ): Promise<PaginatedResponse<DeviceServiceMonitoringStatus>> {
    const raw = await this.http.request<unknown>(
      `/api/devices/${deviceId}/service-monitor-status`,
    );
    return toPaginated<DeviceServiceMonitoringStatus>(raw);
  }

  /** `GET /api/devices/{deviceId}/scheduled-tasks` — lists tasks associated with the device. */
  async tasks(
    deviceId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<TaskStatusSummary>> {
    const raw = await this.http.request<unknown>(`/api/devices/${deviceId}/scheduled-tasks`, {
      params,
    });
    return toPaginated<TaskStatusSummary>(raw, params);
  }

  /** `GET /api/devices/{deviceId}/maintenance-windows` — lists the device's maintenance windows. */
  async maintenanceWindows(deviceId: number): Promise<PaginatedResponse<MaintenanceWindow>> {
    const raw = await this.http.request<unknown>(`/api/devices/${deviceId}/maintenance-windows`);
    return toPaginated<MaintenanceWindow>(raw);
  }

  /**
   * `POST /api/devices/maintenance-windows` — adds maintenance windows to
   * one or more devices.
   */
  async addMaintenanceWindows(
    deviceIds: number[],
    windows: MaintenanceWindowRequest[],
  ): Promise<MaintenanceWindowResponse> {
    return this.http.request<MaintenanceWindowResponse>('/api/devices/maintenance-windows', {
      method: 'POST',
      body: { deviceIDs: deviceIds, maintenanceWindows: windows },
    });
  }

  /**
   * `DELETE /api/devices/maintenance-windows` — deletes maintenance windows
   * by schedule ID. IRREVERSIBLE.
   */
  async deleteMaintenanceWindows(scheduleIds: number[]): Promise<MaintenanceWindowResponse> {
    return this.http.request<MaintenanceWindowResponse>('/api/devices/maintenance-windows', {
      method: 'DELETE',
      body: { scheduleIds },
    });
  }

  /** `GET /api/devices/{deviceId}/custom-properties` — lists the device's custom properties. */
  async customProperties(
    deviceId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<DeviceCustomProperty>> {
    const raw = await this.http.request<unknown>(`/api/devices/${deviceId}/custom-properties`, {
      params,
    });
    return toPaginated<DeviceCustomProperty>(raw, params);
  }

  /** `GET /api/devices/{deviceId}/custom-properties/{propertyId}` — gets one custom property. */
  async getCustomProperty(deviceId: number, propertyId: number): Promise<DeviceCustomProperty> {
    const raw = await this.http.request<unknown>(
      `/api/devices/${deviceId}/custom-properties/${propertyId}`,
    );
    return unwrap<DeviceCustomProperty>(raw);
  }

  /**
   * `PUT /api/devices/{deviceId}/custom-properties/{propertyId}` — updates
   * the value of a device custom property.
   */
  async updateCustomProperty(
    deviceId: number,
    propertyId: number,
    value: string,
  ): Promise<DevicePropertyUpdated> {
    return this.http.request<DevicePropertyUpdated>(
      `/api/devices/${deviceId}/custom-properties/${propertyId}`,
      { method: 'PUT', body: { value } },
    );
  }
}
