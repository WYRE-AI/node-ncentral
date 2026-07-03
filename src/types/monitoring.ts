/** `ActiveIssue` — an active issue on an org unit (PREVIEW). */
export interface ActiveIssue {
  orgUnitId?: number;
  deviceId?: number;
  notificationState?: number;
  serviceId?: number;
  serviceName?: string;
  serviceType?: string;
  taskId?: number;
  serviceItemId?: number;
  /** Additional non-default fields returned by the server. */
  _extra?: Record<string, unknown>;
  [key: string]: unknown;
}

/** A job status entry on an org unit (PREVIEW; schema is not modelled by the API docs). */
export type JobStatus = Record<string, unknown>;
