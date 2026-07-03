import type { PaginationParams } from '../pagination.js';

/** `Device` — a device managed by N-central. */
export interface Device {
  deviceId?: number;
  uri?: string;
  remoteControlUri?: string;
  sourceUri?: string;
  longName?: string;
  deviceClass?: string;
  description?: string;
  isProbe?: boolean;
  osId?: string;
  supportedOs?: string;
  discoveredName?: string;
  deviceClassLabel?: string;
  supportedOsLabel?: string;
  lastLoggedInUser?: string;
  stillLoggedIn?: string;
  licenseMode?: string;
  orgUnitId?: number;
  soId?: number;
  soName?: string;
  customerId?: number;
  customerName?: string;
  siteId?: number;
  siteName?: string;
  lastApplianceCheckinTime?: string;
  [key: string]: unknown;
}

/** Query parameters for device list endpoints (adds saved-filter support). */
export interface DeviceListParams extends PaginationParams {
  /** ID of a saved device filter to apply. */
  filterId?: number;
}

/**
 * `DeviceAssetInfoResponse.data` — asset information about a device,
 * keyed by category (`os`, `application`, `computersystem`,
 * `networkadapter`, `device`, `processor`, ...).
 */
export interface DeviceAssetInfo {
  [category: string]: unknown;
}

/** `AssetLifecycleDetails` — warranty / lifecycle info for a device asset. */
export interface AssetLifecycleDetails {
  warrantyExpiryDate?: string;
  leaseExpiryDate?: string;
  expectedReplacementDate?: string;
  purchaseDate?: string;
  cost?: number;
  location?: string;
  assetTag?: string;
  description?: string;
  updateWarrantyError?: string;
}

/** `AssetLifecyclePatchRequest` — partial lifecycle-info update (PATCH). */
export type AssetLifecyclePatchRequest = AssetLifecycleDetails;

/** `AssetLifecyclePutRequest` — full lifecycle-info replacement (PUT). */
export interface AssetLifecyclePutRequest extends AssetLifecycleDetails {
  /** When true, clears every lifecycle field. */
  allNull?: boolean;
}

/** `DeviceServiceMonitoringStatus` — status of one service monitored on a device. */
export interface DeviceServiceMonitoringStatus {
  taskId?: number;
  serviceId?: number;
  timeToStale?: number;
  taskNote?: string;
  taskIdent?: string;
  stateStatus?: string;
  lastUpdate?: string;
  lastDataId?: number;
  createdOn?: string;
  moduleName?: string;
  serviceItemId?: number;
  lastScanTime?: string;
  isManagedTask?: boolean;
  transitionTime?: string;
  applianceId?: number;
  applianceName?: string;
}

/** `Filter` — a saved device filter. */
export interface DeviceFilter {
  filterId?: string;
  filterName?: string;
  description?: string;
}

/** Query parameters for `GET /api/device-filters`. */
export interface DeviceFilterListParams extends PaginationParams {
  /** Filter scope, e.g. `ALL` or `OWN_AND_USED`. */
  viewScope?: string;
}

/** `DeviceCustomProperty` — a custom property on a device. */
export interface DeviceCustomProperty {
  propertyId?: number;
  propertyName?: string;
  propertyType?: string;
  value?: string;
  enumeratedValueList?: string[];
}

/** `DevicePropertyUpdated` — response of a device property update. */
export interface DevicePropertyUpdated {
  _warnings?: string[];
}

/** `Action` — a key/value pair describing a maintenance-window action. */
export interface MaintenanceWindowAction {
  Key?: string;
  Value?: string;
}

/** `ApplicableAction` — actions a maintenance window applies to. */
export interface ApplicableAction {
  type?: string;
  actions?: MaintenanceWindowAction[];
}

/** `MaintenanceWindowRequest` — a maintenance window to create on devices. */
export interface MaintenanceWindowRequest {
  applicableAction: ApplicableAction[];
  cron: string;
  /** Duration in minutes. */
  duration: number;
  enabled: boolean;
  name: string;
  type: string;
  downtimeOnAction?: boolean;
  maxDowntime?: number;
  rebootMethod?: string;
  rebootDelay?: number;
  userMessageEnabled?: boolean;
  userMessage?: string;
  messageSenderEnabled?: boolean;
  messageSender?: string;
  preserveStateEnabled?: boolean;
}

/** `MaintenanceWindowGetResponse` — a maintenance window configured on a device. */
export interface MaintenanceWindow {
  scheduleID?: number;
  userName?: string;
  lastUpdated?: string;
  applicableAction?: ApplicableAction[];
  name?: string;
  type?: string;
  cron?: string;
  duration?: number;
  enabled?: boolean;
  maxDowntime?: number;
  rebootMethod?: string;
  rebootDelay?: number;
  downtimeOnAction?: boolean;
  userMessageEnabled?: boolean;
  userMessage?: string;
  messageSenderEnabled?: boolean;
  messageSender?: string;
  preserveStateEnabled?: boolean;
  ruleID?: number;
  ruleName?: string;
}

/** `MaintenanceWindowResponse` — result of adding/deleting maintenance windows. */
export interface MaintenanceWindowResponse {
  success?: boolean;
}
