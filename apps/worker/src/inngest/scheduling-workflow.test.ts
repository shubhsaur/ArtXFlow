import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleCreated } from './functions/scheduling';
import {
  scheduleRepository,
  destinationRepository,
  articleRepository,
  articleVersionRepository,
  platformConnectionRepository,
  type Schedule,
  type Destination,
  type Article,
  type ArticleVersion,
  type PlatformConnection,
} from '@artxflow/database';
import { PublishArticleService } from '@artxflow/publishing';
import { NonRetriableError } from 'inngest';

describe('Worker Scheduled Publication Workflow', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const scheduleId = 'sched-uuid-1';
  const articleId = 'art-uuid-1';
  const versionId = 'ver-uuid-1';
  const destId = 'dest-uuid-1';
  const connId = 'conn-uuid-1';
  const scheduledTimeStr = '2026-10-15T18:30:00.000Z';

  let mockSchedule: Schedule;
  let mockDestination: Destination;
  let mockArticle: Article;
  let mockVersion: ArticleVersion;
  let mockConnection: PlatformConnection;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSchedule = {
      id: scheduleId,
      organizationId: orgId,
      articleId,
      articleVersionId: versionId,
      destinationIds: [destId],
      destinationOverrides: { [destId]: { title: 'Scheduled Headline' } },
      scheduledAt: new Date(scheduledTimeStr),
      timezone: 'America/New_York',
      status: 'SCHEDULED',
      workflowId: null,
      errorMessage: null,
      errorCode: null,
      executedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };

    mockDestination = {
      id: destId,
      organizationId: orgId,
      type: 'DEVTO',
      name: 'My DEV.to',
      connectionId: connId,
      siteId: null,
      config: {},
      status: 'ACTIVE',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };

    mockArticle = {
      id: articleId,
      organizationId: orgId,
      title: 'Scheduled Article Title',
      slug: 'scheduled-article-title',
      excerpt: 'Scheduled excerpt',
      status: 'READY',
      coverAssetId: null,
      authorId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };

    mockVersion = {
      id: versionId,
      articleId,
      versionNumber: 1,
      content: '# Scheduled Article Markdown',
      contentFormat: 'markdown',
      metadata: {},
      createdBy: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    mockConnection = {
      id: connId,
      organizationId: orgId,
      provider: 'DEVTO',
      status: 'CONNECTED',
      encryptedSecret: 'encrypted-secret',
      tokenMetadata: {},
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };

    vi.spyOn(scheduleRepository, 'findForOrganization').mockResolvedValue(mockSchedule);
    vi.spyOn(scheduleRepository, 'updateStatus').mockImplementation(async (_id, _org, update) => ({
      ...mockSchedule,
      ...update,
    }));
    vi.spyOn(articleRepository, 'findById').mockResolvedValue(mockArticle);
    vi.spyOn(articleVersionRepository, 'findById').mockResolvedValue(mockVersion);
    vi.spyOn(destinationRepository, 'findForOrganization').mockResolvedValue(mockDestination);
    vi.spyOn(platformConnectionRepository, 'findForOrganization').mockResolvedValue(mockConnection);
  });

  const createMockInngestContext = () => ({
    event: {
      name: 'artxflow/schedule.created',
      data: {
        scheduleId,
        organizationId: orgId,
        articleVersionId: versionId,
        scheduledAt: scheduledTimeStr,
        correlationId: 'corr-sched-1',
      },
    },
    step: {
      sleepUntil: vi.fn().mockResolvedValue(undefined),
      run: vi.fn().mockImplementation(async (_name, fn) => fn()),
    },
  });

  type InngestHandler = {
    fn: (
      ctx: ReturnType<typeof createMockInngestContext>,
    ) => Promise<{ status: string; scheduleId: string; publicationCount?: number }>;
  };
  const executeHandler = (scheduleCreated as unknown as InngestHandler).fn;

  it('sleeps until scheduled time, validates prerequisites, triggers publication, and completes', async () => {
    const publishSpy = vi
      .spyOn(PublishArticleService.prototype, 'publishArticle')
      .mockResolvedValueOnce({
        articleId,
        articleVersionId: versionId,
        publications: [
          {
            id: 'pub-1',
            organizationId: orgId,
            articleId,
            articleVersionId: versionId,
            destinationId: destId,
            status: 'QUEUED',
            attemptCount: 0,
            overrides: { title: 'Scheduled Headline' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      });

    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(ctx.step.sleepUntil).toHaveBeenCalledWith(
      'wait-for-scheduled-time',
      new Date(scheduledTimeStr),
    );

    expect(scheduleRepository.updateStatus).toHaveBeenCalledWith(
      scheduleId,
      orgId,
      expect.objectContaining({ status: 'EXECUTING' }),
    );

    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: orgId,
        correlationId: 'corr-sched-1',
      }),
      expect.objectContaining({
        articleId,
        articleVersionId: versionId,
        destinationIds: [destId],
        destinationOverrides: { [destId]: { title: 'Scheduled Headline' } },
      }),
    );

    expect(scheduleRepository.updateStatus).toHaveBeenCalledWith(
      scheduleId,
      orgId,
      expect.objectContaining({ status: 'COMPLETED' }),
    );

    expect(result.status).toBe('COMPLETED');
    expect(result.publicationCount).toBe(1);
  });

  it('prevents publication if schedule was canceled prior to execution', async () => {
    mockSchedule.status = 'CANCELED';

    const publishSpy = vi.spyOn(PublishArticleService.prototype, 'publishArticle');
    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(ctx.step.sleepUntil).toHaveBeenCalled();
    expect(publishSpy).not.toHaveBeenCalled();
    expect(result.status).toBe('CANCELED');
  });

  it('prevents duplicate execution if schedule is already EXECUTING or COMPLETED', async () => {
    mockSchedule.status = 'COMPLETED';

    const publishSpy = vi.spyOn(PublishArticleService.prototype, 'publishArticle');
    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(publishSpy).not.toHaveBeenCalled();
    expect(result.status).toBe('COMPLETED');
  });

  it('surfaces invalid destination clearly and fails the schedule', async () => {
    vi.spyOn(destinationRepository, 'findForOrganization').mockResolvedValueOnce(null);

    const publishSpy = vi.spyOn(PublishArticleService.prototype, 'publishArticle');
    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);

    expect(publishSpy).not.toHaveBeenCalled();
    expect(scheduleRepository.updateStatus).toHaveBeenCalledWith(
      scheduleId,
      orgId,
      expect.objectContaining({
        status: 'FAILED',
        errorCode: 'INVALID_DESTINATION',
      }),
    );
  });

  it('surfaces inactive destination clearly and fails the schedule', async () => {
    mockDestination.status = 'INACTIVE';

    const publishSpy = vi.spyOn(PublishArticleService.prototype, 'publishArticle');
    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);

    expect(publishSpy).not.toHaveBeenCalled();
    expect(scheduleRepository.updateStatus).toHaveBeenCalledWith(
      scheduleId,
      orgId,
      expect.objectContaining({
        status: 'FAILED',
        errorCode: 'INVALID_DESTINATION',
      }),
    );
  });

  it('surfaces inactive platform connection clearly and fails the schedule', async () => {
    mockConnection.status = 'REVOKED';

    const publishSpy = vi.spyOn(PublishArticleService.prototype, 'publishArticle');
    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);

    expect(publishSpy).not.toHaveBeenCalled();
    expect(scheduleRepository.updateStatus).toHaveBeenCalledWith(
      scheduleId,
      orgId,
      expect.objectContaining({
        status: 'FAILED',
        errorCode: 'INVALID_CONNECTION',
      }),
    );
  });
});
