import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsSyncService } from './analytics-sync.service';
import { PlatformError, PlatformAdapterRegistry } from '@artxflow/platform-adapters';
import type { PlatformAdapter } from '@artxflow/platform-adapters';
import type {
  PublicationRepository,
  DestinationRepository,
  AnalyticsRepository,
  Publication,
  Destination,
  AnalyticsSnapshot,
} from '@artxflow/database';
import type { PlatformConnectionService } from './platform-connection.service';

describe('AnalyticsSyncService (TASK-028)', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const pubId = 'pub-uuid-1';
  const destId = 'dest-uuid-1';

  const mockPublishedPublication: Publication = {
    id: pubId,
    organizationId: orgId,
    articleId: 'art-1',
    articleVersionId: 'ver-1',
    destinationId: destId,
    status: 'PUBLISHED',
    externalResourceId: 'devto-12345',
    externalUrl: 'https://dev.to/article-12345',
    publishedAt: new Date('2026-09-15T10:00:00Z'),
    lastAttemptAt: new Date('2026-09-15T10:00:00Z'),
    attemptCount: 1,
    lastErrorCode: null,
    lastErrorMessage: null,
    overrides: {},
    createdAt: new Date('2026-09-15T10:00:00Z'),
    updatedAt: new Date('2026-09-15T10:00:00Z'),
  };

  const mockDestination: Destination = {
    id: destId,
    organizationId: orgId,
    type: 'DEVTO',
    name: 'My DEV.to Channel',
    connectionId: 'conn-1',
    siteId: null,
    config: {},
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  let mockPubRepo: {
    findForOrganization: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let mockDestRepo: { findForOrganization: ReturnType<typeof vi.fn> };
  let mockAnalyticsRepo: {
    createSnapshot: ReturnType<typeof vi.fn>;
    recordRawEvent: ReturnType<typeof vi.fn>;
  };
  let mockConnService: { getDecryptedSecret: ReturnType<typeof vi.fn> };
  let mockAdapter: {
    provider: string;
    getCapabilities: ReturnType<typeof vi.fn>;
    fetchMetrics: ReturnType<typeof vi.fn>;
  };
  let registry: PlatformAdapterRegistry;
  let service: AnalyticsSyncService;

  beforeEach(() => {
    mockPubRepo = {
      findForOrganization: vi.fn().mockResolvedValue(mockPublishedPublication),
      updateStatus: vi.fn(),
    };
    mockDestRepo = {
      findForOrganization: vi.fn().mockResolvedValue(mockDestination),
    };
    mockAnalyticsRepo = {
      createSnapshot: vi.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'snap-created-1',
          ...data,
          createdAt: new Date(),
        } as AnalyticsSnapshot),
      ),
      recordRawEvent: vi.fn().mockResolvedValue({ id: 'raw-1' }),
    };
    mockConnService = {
      getDecryptedSecret: vi.fn().mockResolvedValue('devto-test-key'),
    };
    mockAdapter = {
      provider: 'DEVTO',
      getCapabilities: vi.fn().mockReturnValue({ analytics: true }),
      fetchMetrics: vi.fn().mockResolvedValue({
        views: 1200,
        reactions: 75,
        comments: 18,
        raw: { page_views_count: 1200, public_reactions_count: 75 },
        capturedAt: '2026-09-17T14:00:00.000Z',
      }),
    };

    registry = new PlatformAdapterRegistry();
    registry.register(mockAdapter as unknown as PlatformAdapter);

    service = new AnalyticsSyncService({
      publicationRepo: mockPubRepo as unknown as PublicationRepository,
      destinationRepo: mockDestRepo as unknown as DestinationRepository,
      analyticsRepo: mockAnalyticsRepo as unknown as AnalyticsRepository,
      connectionService: mockConnService as unknown as PlatformConnectionService,
      adapterRegistry: registry,
    });
  });

  it('successfully fetches provider metrics and stores normalized analytics snapshot', async () => {
    const result = await service.syncPublicationMetrics({
      organizationId: orgId,
      publicationId: pubId,
    });

    expect(result.success).toBe(true);
    expect(result.metrics).toEqual({
      views: 1200,
      likes: 75,
      comments: 18,
      shares: 0,
      bookmarks: 0,
    });

    // Invariant: Snapshot has explicit capturedAt and retains raw provider data
    expect(mockAnalyticsRepo.createSnapshot).toHaveBeenCalledTimes(1);
    const [snapshotCall] = mockAnalyticsRepo.createSnapshot.mock.calls;
    expect(snapshotCall[0].organizationId).toBe(orgId);
    expect(snapshotCall[0].publicationId).toBe(pubId);
    expect(snapshotCall[0].destinationId).toBe(destId);
    expect(snapshotCall[0].views).toBe(1200);
    expect(snapshotCall[0].likes).toBe(75);
    expect(snapshotCall[0].metrics).toEqual({
      page_views_count: 1200,
      public_reactions_count: 75,
    });

    // Telemetry event recorded
    expect(mockAnalyticsRepo.recordRawEvent).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsRepo.recordRawEvent.mock.calls[0][0].eventType).toBe(
      'ANALYTICS_SYNC_COMPLETED',
    );

    // CRITICAL INVARIANT: publication status must NEVER be updated
    expect(mockPubRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('skips sync when provider does not support analytics (e.g. Medium)', async () => {
    mockAdapter.getCapabilities.mockReturnValueOnce({ analytics: false });

    const result = await service.syncPublicationMetrics({
      organizationId: orgId,
      publicationId: pubId,
    });

    expect(result.success).toBe(true);
    expect(result.skipped).toBe(true);
    expect(result.reason).toContain('does not support analytics');

    expect(mockAdapter.fetchMetrics).not.toHaveBeenCalled();
    expect(mockAnalyticsRepo.createSnapshot).not.toHaveBeenCalled();
    expect(mockPubRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('skips sync when publication is not published', async () => {
    mockPubRepo.findForOrganization.mockResolvedValueOnce({
      ...mockPublishedPublication,
      status: 'PUBLISHING',
    });

    const result = await service.syncPublicationMetrics({
      organizationId: orgId,
      publicationId: pubId,
    });

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(mockAnalyticsRepo.createSnapshot).not.toHaveBeenCalled();
    expect(mockPubRepo.updateStatus).not.toHaveBeenCalled();
  });

  it('records observable failure when adapter throws rate limit or error, leaving publication state intact', async () => {
    mockAdapter.fetchMetrics.mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'RATE_LIMITED',
        message: 'Rate limit hit',
        retryable: true,
      }),
    );

    await expect(
      service.syncPublicationMetrics({
        organizationId: orgId,
        publicationId: pubId,
      }),
    ).rejects.toThrow(PlatformError);

    // Observable failure event recorded in raw events
    expect(mockAnalyticsRepo.recordRawEvent).toHaveBeenCalledTimes(1);
    const [eventCall] = mockAnalyticsRepo.recordRawEvent.mock.calls;
    expect(eventCall[0].eventType).toBe('ANALYTICS_SYNC_FAILED');
    expect(eventCall[0].payload.errorCode).toBe('RATE_LIMITED');
    expect(eventCall[0].payload.retryable).toBe(true);

    // CRITICAL: publication status remains completely untouched
    expect(mockPubRepo.updateStatus).not.toHaveBeenCalled();
  });
});
