import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NCentralClient } from '../../src/index.js';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL, TEST_JWT } from '../mocks/handlers.js';
import { server } from '../mocks/server.js';

const client = new NCentralClient({
  serverUrl: BASE_URL,
  jwt: TEST_JWT,
  requestsPerSecond: 1000,
});

describe('ScheduledTasksResource', () => {
  it('createDirect() unwraps the created taskId', async () => {
    let seenBody: unknown;
    server.use(
      http.post(`${BASE_URL}/api/scheduled-tasks/direct`, async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json(fixtures.taskCreated, { status: 201 });
      }),
    );

    const task = {
      name: 'Reboot Device',
      itemId: 1,
      taskType: 'MacroScript',
      customerId: 200,
      deviceId: 987654321,
      credential: { type: 'LocalSystem' },
      parameters: [
        { name: 'Force', value: 'true', description: 'Force reboot', type: 'boolean' },
      ],
    };
    const created = await client.scheduledTasks.createDirect(task);

    expect(created.taskId).toBe(4242);
    expect(seenBody).toEqual(task);
  });

  it('get() unwraps the task info envelope', async () => {
    const info = await client.scheduledTasks.get(4242);
    expect(info.taskId).toBe(4242);
    expect(info.taskName).toBe('Reboot Device');
  });

  it('status() unwraps the aggregated status envelope', async () => {
    const status = await client.scheduledTasks.status(4242);
    expect(status.taskName).toBe('Reboot Device');
    expect(status.statusCounts).toEqual({ Completed: 1 });
  });

  it('statusDetails() returns per-device details', async () => {
    const page = await client.scheduledTasks.statusDetails(4242);
    expect(page.data[0].deviceName).toBe('ACME-DC01');
    expect(page.data[0].status).toBe('Completed');
  });

  it('applianceTaskInfo() returns appliance task information', async () => {
    const info = await client.scheduledTasks.applianceTaskInfo(9001);
    expect(info.state).toBe('Normal');
    expect(info.serviceDetails).toHaveLength(1);
  });
});
