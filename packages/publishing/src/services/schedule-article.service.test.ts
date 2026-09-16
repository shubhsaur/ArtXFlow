import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScheduleArticleService } from './schedule-article.service';
import { MemoryJobQueue } from '../queue/memory-job-queue';
import {
  UnauthorizedTenantAccessError,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
} from '../errors';
import { PastScheduledTimeError } from '../utils/timezone';
import type {
  Article,
  ArticleVersion,
  Destination,
  Schedule,
  ArticleRepository,
  ArticleVersionRepository,
  DestinationRepository,
  ScheduleRepository,
  OrganizationRepository,
  SiteRepository,
} from '@artxflow/database';

describe('ScheduleArticleService', () => {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = 'user-test-123';
  const articleId = '00000000-0000-0000-0000-000000000002';
  const versionId = '00000000-0000-0000-0000-000000000003';
  const destId = '00000000-0000-0000-0000-000000000004';
  const scheduleId = '00000000-0000-0000-0000-000000000005';

  let mockArticle: Article;
  let mockVersion: ArticleVersion;
  let mockDestination: Destination;
  let mockSchedule: Schedule;

  let mockArticleRepo: ArticleRepository;
  let mockArticleVersionRepo: ArticleVersionRepository;
  let mockDestRepo: DestinationRepository;
  let mockScheduleRepo: ScheduleRepository;
  let mockSiteRepo: SiteRepository;
  let mockOrgRepo: OrganizationRepository;
  let memoryJobQueue: MemoryJobQueue;
  let service: ScheduleArticleService;

  beforeEach(() => {
    mockArticle = {
      id: articleId,
      organizationId: orgId,
      authorId: userId,
      title: 'Canonical Article',
      slug: 'canonical-article',
      excerpt: 'Excerpt',
      status: 'READY',
      coverAssetId: null,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockVersion = {
      id: versionId,
      articleId,
      versionNumber: 1,
      content: '# Heading\nContent body markdown.',
      contentFormat: 'markdown',
      metadata: {},
      createdBy: userId,
      createdAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockDestination = {
      id: destId,
      organizationId: orgId,
      type: 'DEVTO',
      name: 'DEV.to',
      connectionId: 'conn-1',
      siteId: null,
      config: {},
      status: 'ACTIVE',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockSchedule = {
      id: scheduleId,
      organizationId: orgId,
      articleId,
      articleVersionId: versionId,
      destinationIds: [destId],
      destinationOverrides: {},
      scheduledAt: new Date(Date.now() + 3600000), // 1 hour future
      timezone: 'America/New_York',
      status: 'SCHEDULED',
      workflowId: null,
      errorMessage: null,
      errorCode: null,
      executedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockArticleRepo = {
      findArticleForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        return org === orgId && id === articleId ? { ...mockArticle } : null;
      }),
      findById: vi.fn().mockResolvedValue(mockArticle),
    } as unknown as ArticleRepository;

    mockArticleVersionRepo = {
      getLatestVersion: vi.fn().mockResolvedValue(mockVersion),
      findForArticle: vi.fn().mockImplementation(async (art: string, ver: string) => {
        return art === articleId && ver === versionId ? { ...mockVersion } : null;
      }),
    } as unknown as ArticleVersionRepository;

    mockDestRepo = {
      findForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        return org === orgId && id === destId ? { ...mockDestination } : null;
      }),
      listByOrganization: vi.fn().mockResolvedValue([mockDestination]),
    } as unknown as DestinationRepository;

    mockScheduleRepo = {
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => ({
        ...mockSchedule,
        ...data,
      })),
      findForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        return org === orgId && id === scheduleId ? { ...mockSchedule } : null;
      }),
      listByArticle: vi.fn().mockResolvedValue([mockSchedule]),
      listByOrganization: vi.fn().mockResolvedValue([mockSchedule]),
      updateStatus: vi
        .fn()
        .mockImplementation(async (_id: string, _org: string, data: Record<string, unknown>) => ({
          ...mockSchedule,
          ...data,
        })),
      cancel: vi.fn().mockImplementation(async () => ({
        ...mockSchedule,
        status: 'CANCELED' as const,
      })),
    } as unknown as ScheduleRepository;

    mockSiteRepo = {
      listByOrganization: vi.fn().mockResolvedValue([]),
    } as unknown as SiteRepository;

    mockOrgRepo = {
      getOrganizationForUser: vi.fn().mockImplementation(async (org: string, user: string) => {
        return org === orgId && user === userId
          ? { organization: { id: orgId }, role: 'OWNER' }
          : null;
      }),
    } as unknown as OrganizationRepository;

    memoryJobQueue = new MemoryJobQueue();

    service = new ScheduleArticleService({
      scheduleRepo: mockScheduleRepo,
      articleRepo: mockArticleRepo,
      articleVersionRepo: mockArticleVersionRepo,
      destinationRepo: mockDestRepo,
      siteRepo: mockSiteRepo,
      orgRepo: mockOrgRepo,
      jobQueue: memoryJobQueue,
    });
  });

  describe('scheduleArticle', () => {
    it('schedules publication capturing version snapshot and normalizes timezone to UTC', async () => {
      const futureTime = new Date(Date.now() + 7200000).toISOString(); // 2 hours from now

      const result = await service.scheduleArticle(
        { userId, organizationId: orgId },
        {
          articleId,
          destinationIds: [destId],
          scheduledAt: futureTime,
          timezone: 'America/New_York',
          destinationOverrides: {
            [destId]: { title: 'Scheduled Override Title' },
          },
        },
      );

      expect(mockScheduleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: orgId,
          articleId,
          articleVersionId: versionId,
          destinationIds: [destId],
          timezone: 'America/New_York',
          status: 'SCHEDULED',
        }),
      );

      expect(result.status).toBe('SCHEDULED');
      expect(result.articleVersionId).toBe(versionId);
      expect(result.timezone).toBe('America/New_York');

      const jobs = memoryJobQueue.listJobs();
      expect(jobs).toHaveLength(1);
      expect(jobs[0].type).toBe('SCHEDULE_ARTICLE');
      expect(jobs[0].referenceType).toBe('SCHEDULE');
    });

    it('rejects scheduling a non-existent article', async () => {
      mockArticleRepo.findArticleForOrganization = vi.fn().mockResolvedValue(null);
      const futureTime = new Date(Date.now() + 7200000).toISOString();

      await expect(
        service.scheduleArticle(
          { userId, organizationId: orgId },
          { articleId: 'missing-article-id', scheduledAt: futureTime },
        ),
      ).rejects.toThrow(ArticleNotFoundError);
    });

    it('rejects scheduling an archived article', async () => {
      mockArticle.status = 'ARCHIVED';
      const futureTime = new Date(Date.now() + 7200000).toISOString();

      await expect(
        service.scheduleArticle(
          { userId, organizationId: orgId },
          { articleId, scheduledAt: futureTime },
        ),
      ).rejects.toThrow(ArticleNotPublishableError);
    });

    it('rejects past scheduled times', async () => {
      const pastTime = new Date(Date.now() - 3600000).toISOString();

      await expect(
        service.scheduleArticle(
          { userId, organizationId: orgId },
          { articleId, scheduledAt: pastTime },
        ),
      ).rejects.toThrow(PastScheduledTimeError);
    });

    it('rejects invalid or inactive destinations', async () => {
      const futureTime = new Date(Date.now() + 7200000).toISOString();

      await expect(
        service.scheduleArticle(
          { userId, organizationId: orgId },
          { articleId, destinationIds: ['non-existent-dest'], scheduledAt: futureTime },
        ),
      ).rejects.toThrow(InvalidDestinationConfigurationError);
    });

    it('enforces organization authorization', async () => {
      const futureTime = new Date(Date.now() + 7200000).toISOString();

      await expect(
        service.scheduleArticle(
          { userId: 'unauthorized-user', organizationId: orgId },
          { articleId, scheduledAt: futureTime },
        ),
      ).rejects.toThrow(UnauthorizedTenantAccessError);
    });
  });

  describe('cancelSchedule', () => {
    it('cancels pending schedule successfully', async () => {
      const result = await service.cancelSchedule({ userId, organizationId: orgId }, scheduleId);

      expect(mockScheduleRepo.cancel).toHaveBeenCalledWith(scheduleId, orgId);
      expect(result.status).toBe('CANCELED');
    });

    it('rejects canceling an already completed schedule', async () => {
      mockSchedule.status = 'COMPLETED';

      await expect(
        service.cancelSchedule({ userId, organizationId: orgId }, scheduleId),
      ).rejects.toThrow(InvalidScheduleStateError);
    });

    it('throws ScheduleNotFoundError when schedule is missing', async () => {
      await expect(
        service.cancelSchedule({ userId, organizationId: orgId }, 'non-existent-schedule'),
      ).rejects.toThrow(ScheduleNotFoundError);
    });
  });

  describe('list and get schedules', () => {
    it('lists schedules for article', async () => {
      const list = await service.listSchedulesForArticle(
        { userId, organizationId: orgId },
        articleId,
      );

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(scheduleId);
    });

    it('lists schedules for organization', async () => {
      const list = await service.listSchedulesForOrganization(
        { userId, organizationId: orgId },
        { status: 'SCHEDULED' },
      );

      expect(list).toHaveLength(1);
    });

    it('retrieves single schedule', async () => {
      const schedule = await service.getSchedule({ userId, organizationId: orgId }, scheduleId);

      expect(schedule.id).toBe(scheduleId);
    });
  });
});
