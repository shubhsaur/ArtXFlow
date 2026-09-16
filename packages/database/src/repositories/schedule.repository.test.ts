import { describe, it, expect, vi } from 'vitest';
import { ScheduleRepository } from './schedule.repository';
import { schedules, type Schedule } from '../schema/publishing';
import type { DbClient } from '../client';

describe('ScheduleRepository', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const org2Id = '22222222-2222-2222-2222-222222222222';
  const articleId = 'aaaa1111-1111-1111-1111-111111111111';
  const versionId = 'bbbb1111-1111-1111-1111-111111111111';
  const scheduleId = 'sched-uuid-1';
  const scheduledTime = new Date('2026-10-15T14:30:00Z');

  const mockSchedule: Schedule = {
    id: scheduleId,
    organizationId: org1Id,
    articleId,
    articleVersionId: versionId,
    destinationIds: ['dest-1', 'dest-2'],
    destinationOverrides: { 'dest-1': { title: 'Overridden title' } },
    scheduledAt: scheduledTime,
    timezone: 'America/New_York',
    status: 'SCHEDULED',
    workflowId: 'wf-123',
    errorMessage: null,
    errorCode: null,
    executedAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  it('creates a new schedule record', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSchedule]),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.create({
      organizationId: org1Id,
      articleId,
      articleVersionId: versionId,
      destinationIds: ['dest-1', 'dest-2'],
      destinationOverrides: { 'dest-1': { title: 'Overridden title' } },
      scheduledAt: scheduledTime,
      timezone: 'America/New_York',
      status: 'SCHEDULED',
    });

    expect(result).toEqual(mockSchedule);
    expect(mockDb.insert).toHaveBeenCalledWith(schedules);
  });

  it('finds schedule by ID without tenant scoping', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSchedule]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.findById(scheduleId);

    expect(result).toEqual(mockSchedule);
  });

  it('finds schedule for organization enforcing tenant boundaries', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSchedule]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.findForOrganization(org1Id, scheduleId);

    expect(result).toEqual(mockSchedule);
  });

  it('returns null when schedule not found in organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.findForOrganization(org2Id, scheduleId);

    expect(result).toBeNull();
  });

  it('lists schedules by article', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockSchedule]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const list = await repo.listByArticle(org1Id, articleId);

    expect(list).toHaveLength(1);
    expect(list[0]).toEqual(mockSchedule);
  });

  it('lists schedules by organization with optional status filter', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([mockSchedule]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const list = await repo.listByOrganization(org1Id, { status: 'SCHEDULED' });

    expect(list).toHaveLength(1);
  });

  it('updates schedule status and error details', async () => {
    const updatedMock = {
      ...mockSchedule,
      status: 'FAILED' as const,
      errorCode: 'INVALID_DESTINATION',
      errorMessage: 'Destination dest-1 is inactive',
    };

    const mockDb = {
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedMock]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.updateStatus(scheduleId, org1Id, {
      status: 'FAILED',
      errorCode: 'INVALID_DESTINATION',
      errorMessage: 'Destination dest-1 is inactive',
    });

    expect(result.status).toBe('FAILED');
    expect(result.errorCode).toBe('INVALID_DESTINATION');
  });

  it('cancels a pending schedule successfully', async () => {
    const canceledMock = {
      ...mockSchedule,
      status: 'CANCELED' as const,
    };

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSchedule]),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([canceledMock]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    const result = await repo.cancel(scheduleId, org1Id);

    expect(result.status).toBe('CANCELED');
  });

  it('throws when attempting to cancel a non-SCHEDULED schedule', async () => {
    const completedMock = {
      ...mockSchedule,
      status: 'COMPLETED' as const,
    };

    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([completedMock]),
          }),
        }),
      }),
    } as unknown as DbClient;

    const repo = new ScheduleRepository(mockDb);
    await expect(repo.cancel(scheduleId, org1Id)).rejects.toThrow(
      /Cannot cancel schedule with ID 'sched-uuid-1' because it is in 'COMPLETED' status/,
    );
  });
});
