import { describe, it, expect, vi } from 'vitest';
import { AnalyticsRepository } from './analytics.repository';
import type { AnalyticsSnapshot, AnalyticsRawEvent } from '../schema/analytics';
import type { DbExecutor } from './organization.repository';

describe('AnalyticsRepository', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const org2Id = '22222222-2222-2222-2222-222222222222';
  const pubId = 'aaaa1111-1111-1111-1111-111111111111';
  const destId = 'dddd1111-1111-1111-1111-111111111111';

  const mockSnapshot: AnalyticsSnapshot = {
    id: 'snap-1',
    organizationId: org1Id,
    publicationId: pubId,
    destinationId: destId,
    capturedAt: new Date('2026-09-17T12:00:00Z'),
    views: 1500,
    likes: 42,
    comments: 10,
    shares: 5,
    bookmarks: 20,
    metrics: {
      hashnodeReactions: 42,
      hashnodeResponseCount: 10,
    },
    createdAt: new Date('2026-09-17T12:00:05Z'),
  };

  const mockRawEvent: AnalyticsRawEvent = {
    id: 'raw-1',
    organizationId: org1Id,
    publicationId: pubId,
    destinationId: destId,
    eventType: 'DEVTO_ANALYTICS_SYNC',
    payload: {
      page_views_count: 500,
      public_reactions_count: 20,
    },
    occurredAt: new Date('2026-09-17T12:00:00Z'),
    createdAt: new Date('2026-09-17T12:00:01Z'),
  };

  it('creates an analytics snapshot with explicit timestamps and provider metadata', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSnapshot]),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const created = await repo.createSnapshot({
      organizationId: org1Id,
      publicationId: pubId,
      destinationId: destId,
      capturedAt: mockSnapshot.capturedAt,
      views: 1500,
      likes: 42,
      comments: 10,
      shares: 5,
      bookmarks: 20,
      metrics: { hashnodeReactions: 42 },
    });

    expect(created.id).toBe('snap-1');
    expect(created.organizationId).toBe(org1Id);
    expect(created.views).toBe(1500);
    expect(created.likes).toBe(42);
    expect(created.metrics).toEqual({
      hashnodeReactions: 42,
      hashnodeResponseCount: 10,
    });
  });

  it('retrieves snapshot by ID scoped strictly to an organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockSnapshot]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const result = await repo.findForOrganization(org1Id, 'snap-1');
    expect(result).toEqual(mockSnapshot);
  });

  it('returns null if snapshot belongs to another organization', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const result = await repo.findForOrganization(org2Id, 'snap-1');
    expect(result).toBeNull();
  });

  it('finds latest snapshot for a publication ordered by capturedAt desc', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSnapshot]),
            }),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const latest = await repo.findLatestForPublication(org1Id, pubId);
    expect(latest).toEqual(mockSnapshot);
  });

  it('lists historical snapshots for a publication', async () => {
    const mockDb = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockSnapshot]),
            }),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const list = await repo.listSnapshotsForPublication(org1Id, pubId);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('snap-1');
  });

  it('records and lists raw analytics events', async () => {
    const mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockRawEvent]),
        }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockRawEvent]),
            }),
          }),
        }),
      }),
    } as unknown as DbExecutor;

    const repo = new AnalyticsRepository(mockDb);
    const event = await repo.recordRawEvent({
      organizationId: org1Id,
      publicationId: pubId,
      destinationId: destId,
      eventType: 'DEVTO_ANALYTICS_SYNC',
      payload: { page_views_count: 500 },
      occurredAt: mockRawEvent.occurredAt,
    });

    expect(event.eventType).toBe('DEVTO_ANALYTICS_SYNC');

    const events = await repo.listRawEvents(org1Id, pubId);
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('DEVTO_ANALYTICS_SYNC');
  });
});
