import type { HttpClient } from '../http.js';
import {
  toPaginated,
  unwrap,
  type PaginatedResponse,
  type PaginationParams,
} from '../pagination.js';
import type {
  ApplianceTaskInformation,
  DirectSupportTask,
  TaskAggregatedStatus,
  TaskCreate,
  TaskInfo,
  TaskStatusDetail,
} from '../types/tasks.js';

/** Scheduled-task endpoints. */
export class ScheduledTasksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * `POST /api/scheduled-tasks/direct` — creates a direct-support task that
   * executes IMMEDIATELY on the target device. HIGH-IMPACT.
   */
  async createDirect(data: DirectSupportTask): Promise<TaskCreate> {
    const raw = await this.http.request<unknown>('/api/scheduled-tasks/direct', {
      method: 'POST',
      body: data,
    });
    return unwrap<TaskCreate>(raw);
  }

  /** `GET /api/scheduled-tasks/{taskId}` — gets general information about a task. */
  async get(taskId: number): Promise<TaskInfo> {
    const raw = await this.http.request<unknown>(`/api/scheduled-tasks/${taskId}`);
    return unwrap<TaskInfo>(raw);
  }

  /** `GET /api/scheduled-tasks/{taskId}/status` — gets the task's aggregated status. */
  async status(taskId: number): Promise<TaskAggregatedStatus> {
    const raw = await this.http.request<unknown>(`/api/scheduled-tasks/${taskId}/status`);
    return unwrap<TaskAggregatedStatus>(raw);
  }

  /** `GET /api/scheduled-tasks/{taskId}/status/details` — per-device status details. */
  async statusDetails(
    taskId: number,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<TaskStatusDetail>> {
    const raw = await this.http.request<unknown>(
      `/api/scheduled-tasks/${taskId}/status/details`,
      { params },
    );
    return toPaginated<TaskStatusDetail>(raw, params);
  }

  /** `GET /api/appliance-tasks/{taskId}` — appliance-task information details (PREVIEW). */
  async applianceTaskInfo(taskId: number): Promise<ApplianceTaskInformation> {
    const raw = await this.http.request<unknown>(`/api/appliance-tasks/${taskId}`);
    return unwrap<ApplianceTaskInformation>(raw);
  }
}
