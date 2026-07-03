/** `ScheduledTaskCredential` — credential used to run a scheduled task. */
export interface ScheduledTaskCredential {
  /** `LocalSystem`, `DeviceCredentials` or `CustomCredentials`. */
  type: string;
  username?: string;
  password?: string;
}

/** `ScheduledTaskParameter` — a parameter passed to a scheduled task. */
export interface ScheduledTaskParameter {
  name: string;
  value?: string;
  description: string;
  type: string;
}

/**
 * `DirectSupportTask` — body of `POST /api/scheduled-tasks/direct`.
 * Creates a task that executes IMMEDIATELY on the target device.
 */
export interface DirectSupportTask {
  name: string;
  /** Repository item ID of the script/task to execute. */
  itemId: number;
  taskType: string;
  customerId: number;
  deviceId: number;
  credential: ScheduledTaskCredential;
  parameters?: ScheduledTaskParameter[];
}

/** `TaskCreate` — payload of `ScheduledTaskCreateResponse`. */
export interface TaskCreate {
  taskId?: number;
}

/** `TaskInfo` — general information about a scheduled task. */
export interface TaskInfo {
  taskId?: number;
  parentId?: number;
  name?: string;
  taskName?: string;
  itemId?: number;
  type?: string;
  orgUnitId?: number;
  soId?: number;
  customerId?: number;
  siteId?: number;
  applianceId?: number;
  isReactive?: boolean;
  isEnabled?: boolean;
  deviceIds?: string[];
}

/** `TaskAggregatedStatus` — aggregated status counts for a scheduled task. */
export interface TaskAggregatedStatus {
  taskName?: string;
  statusCounts?: Record<string, number>;
}

/** `DetailsResponse` — per-device status detail of a scheduled task. */
export interface TaskStatusDetail {
  taskId?: number;
  deviceId?: number;
  deviceName?: string;
  taskName?: string;
  status?: string;
  output?: string;
  message?: string;
  outputFileName?: string;
}

/** `TaskStatusResponse` — status summary of a task associated with a device. */
export interface TaskStatusSummary {
  taskId?: number;
  taskName?: string;
  status?: string;
}

/** `ApplianceTaskThresholdBasic` — threshold on an appliance-task detail. */
export interface ApplianceTaskThresholdBasic {
  state?: string;
  lowValue?: number;
  highValue?: number;
}

/** `ApplianceTaskStatusDetail` — one detail row of an appliance task. */
export interface ApplianceTaskStatusDetail {
  scanDetailId?: number;
  detailName?: string;
  description?: string;
  detailValue?: string;
  state?: string;
  monitoringType?: string;
  thresholds?: ApplianceTaskThresholdBasic[];
}

/** `ApplianceTaskInformation` — response of `GET /api/appliance-tasks/{taskId}` (PREVIEW). */
export interface ApplianceTaskInformation {
  scanTime?: string;
  state?: string;
  errorMessage?: string;
  serviceDetails?: ApplianceTaskStatusDetail[];
}
