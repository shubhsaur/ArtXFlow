import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishArticleService } from './publish-article.service';
import { MemoryJobQueue } from '../queue/memory-job-queue';
import {
  UnauthorizedTenantAccessError,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
} from '../errors';
import type {
  Article,
  ArticleVersion,
  Destination,
  Publication,
  Site,
  ArticleRepository,
  ArticleVersionRepository,
  DestinationRepository,
  PublicationRepository,
  PublicationEventRepository,
  SiteRepository,
  OrganizationRepository,
} from '@artxflow/database';

describe('PublishArticleService', () => {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = 'user-test-123';
  const articleId = '00000000-0000-0000-0000-000000000002';
  const versionId = '00000000-0000-0000-0000-000000000003';
  const destId = '00000000-0000-0000-0000-000000000004';
  const siteId = '00000000-0000-0000-0000-000000000005';

  let mockArticle: Article;
  let mockVersion: ArticleVersion;
  let mockDestination: Destination;
  let mockSite: Site;
  let mockPublication: Publication;

  let mockArticleRepo: ArticleRepository;
  let mockArticleVersionRepo: ArticleVersionRepository;
  let mockDestRepo: DestinationRepository;
  let mockPubRepo: PublicationRepository;
  let mockPubEventRepo: PublicationEventRepository;
  let mockSiteRepo: SiteRepository;
  let mockOrgRepo: OrganizationRepository;
  let memoryJobQueue: MemoryJobQueue;
  let service: PublishArticleService;

  beforeEach(() => {
    mockArticle = {
      id: articleId,
      organizationId: orgId,
      authorId: userId,
      title: 'Canonical Article Title',
      slug: 'canonical-article-title',
      excerpt: 'Article excerpt',
      status: 'DRAFT',
      coverAssetId: null,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockVersion = {
      id: versionId,
      articleId,
      versionNumber: 1,
      content: '# Heading\nThis is the markdown body of the post.',
      contentFormat: 'markdown',
      metadata: {},
      createdBy: userId,
      createdAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockDestination = {
      id: destId,
      organizationId: orgId,
      type: 'ARTXFLOW_BLOG',
      name: 'Engineering Blog',
      connectionId: null,
      siteId,
      config: { siteId, subdomain: 'engineering' },
      status: 'ACTIVE',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockSite = {
      id: siteId,
      organizationId: orgId,
      name: 'Engineering Blog',
      subdomain: 'engineering',
      customDomain: null,
      status: 'ACTIVE',
      themeConfig: {},
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockPublication = {
      id: 'pub-test-1',
      organizationId: orgId,
      articleId,
      articleVersionId: versionId,
      destinationId: destId,
      status: 'QUEUED',
      externalResourceId: null,
      externalUrl: null,
      publishedAt: null,
      lastAttemptAt: null,
      attemptCount: 0,
      lastErrorCode: null,
      lastErrorMessage: null,
      overrides: {},
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockArticleRepo = {
      findArticleForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        return org === orgId && id === articleId ? { ...mockArticle } : null;
      }),
      findById: vi.fn().mockResolvedValue(mockArticle),
      update: vi.fn().mockResolvedValue(mockArticle),
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
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => ({
        ...mockDestination,
        ...data,
      })),
    } as unknown as DestinationRepository;

    mockPubRepo = {
      findByVersionAndDestination: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => ({
        ...mockPublication,
        ...data,
      })),
      updateStatus: vi
        .fn()
        .mockImplementation(async (_id: string, _org: string, data: Record<string, unknown>) => ({
          ...mockPublication,
          ...data,
        })),
      listByArticleVersion: vi.fn().mockResolvedValue([mockPublication]),
    } as unknown as PublicationRepository;

    mockPubEventRepo = {
      create: vi.fn().mockResolvedValue({ id: 'event-1' }),
    } as unknown as PublicationEventRepository;

    mockSiteRepo = {
      listByOrganization: vi.fn().mockResolvedValue([mockSite]),
    } as unknown as SiteRepository;

    mockOrgRepo = {
      getOrganizationForUser: vi.fn().mockImplementation(async (org: string, user: string) => {
        return org === orgId && user === userId
          ? { organization: { id: orgId }, role: 'OWNER' }
          : null;
      }),
    } as unknown as OrganizationRepository;

    memoryJobQueue = new MemoryJobQueue();

    service = new PublishArticleService({
      articleRepo: mockArticleRepo,
      articleVersionRepo: mockArticleVersionRepo,
      destinationRepo: mockDestRepo,
      publicationRepo: mockPubRepo,
      publicationEventRepo: mockPubEventRepo,
      siteRepo: mockSiteRepo,
      orgRepo: mockOrgRepo,
      jobQueue: memoryJobQueue,
    });
  });

  it('orchestrates end-to-end publish flow and enqueues distribution workflow asynchronously', async () => {
    const result = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );

    expect(result.articleId).toBe(articleId);
    expect(result.articleVersionId).toBe(versionId);
    expect(result.publications).toHaveLength(1);
    expect(result.publications[0]?.destinationId).toBe(destId);
    expect(result.publications[0]?.status).toBe('QUEUED');
    expect(result.jobId).toBeDefined();

    // Verify publication record created
    expect(mockPubRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: orgId,
        articleId,
        articleVersionId: versionId,
        destinationId: destId,
        status: 'QUEUED',
      }),
    );

    // Verify publication event recorded
    expect(mockPubEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'QUEUED',
      }),
    );

    // Verify background queue job enqueued
    expect(memoryJobQueue.listJobs()).toHaveLength(1);
    const enqueued = memoryJobQueue.listJobs()[0];
    expect(enqueued?.type).toBe('DISTRIBUTE_ARTICLE');
    expect(enqueued?.idempotencyKey).toBe(`${orgId}:${versionId}:distribute`);
    expect(enqueued?.payload?.distributionId).toBe(versionId);
  });

  it('throws UnauthorizedTenantAccessError when user has no access to the organization', async () => {
    await expect(
      service.publishArticle({ userId: 'unauthorized-user', organizationId: orgId }, { articleId }),
    ).rejects.toThrow(UnauthorizedTenantAccessError);
  });

  it('throws ArticleNotFoundError when article does not exist in tenant', async () => {
    await expect(
      service.publishArticle(
        { userId, organizationId: orgId },
        { articleId: 'non-existent-article' },
      ),
    ).rejects.toThrow(ArticleNotFoundError);
  });

  it('throws ArticleNotPublishableError when article is ARCHIVED', async () => {
    mockArticle.status = 'ARCHIVED';

    await expect(
      service.publishArticle({ userId, organizationId: orgId }, { articleId }),
    ).rejects.toThrow(ArticleNotPublishableError);
  });

  it('throws ArticleNotPublishableError when version content is empty', async () => {
    mockVersion.content = '';

    await expect(
      service.publishArticle({ userId, organizationId: orgId }, { articleId }),
    ).rejects.toThrow(ArticleNotPublishableError);
  });

  it('auto-provisions default ArtXFlow Blog destination if none exist but an active site is present', async () => {
    (mockDestRepo.listByOrganization as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const result = await service.publishArticle({ userId, organizationId: orgId }, { articleId });

    expect(mockDestRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: orgId,
        type: 'ARTXFLOW_BLOG',
        siteId,
        status: 'ACTIVE',
      }),
    );
    expect(result.publications).toHaveLength(1);
  });

  it('throws InvalidDestinationConfigurationError when no destinations exist and no active site exists', async () => {
    (mockDestRepo.listByOrganization as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (mockSiteRepo.listByOrganization as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await expect(
      service.publishArticle({ userId, organizationId: orgId }, { articleId }),
    ).rejects.toThrow(InvalidDestinationConfigurationError);
  });

  it('reuses existing publication and sets status to QUEUED on republish', async () => {
    (mockPubRepo.findByVersionAndDestination as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockPublication,
      status: 'FAILED',
    });

    const result = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );

    expect(mockPubRepo.updateStatus).toHaveBeenCalledWith(
      mockPublication.id,
      orgId,
      expect.objectContaining({ status: 'QUEUED' }),
    );
    expect(mockPubRepo.create).not.toHaveBeenCalled();
    expect(result.publications).toHaveLength(1);
  });

  it('enqueues a fresh distribution job with correlation-scoped key when base idempotency key already exists', async () => {
    // First publish succeeds with base key
    const firstResult = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );
    expect(firstResult.jobId).toBeDefined();
    expect(memoryJobQueue.listJobs()).toHaveLength(1);
    expect(memoryJobQueue.listJobs()[0]?.idempotencyKey).toBe(`${orgId}:${versionId}:distribute`);

    // Second publish for the same version detects ALREADY_EXISTS and enqueues with run key
    const correlationId = 'corr-unique-run-2';
    const secondResult = await service.publishArticle(
      { userId, organizationId: orgId, correlationId },
      { articleId, destinationIds: [destId] },
    );
    expect(secondResult.jobId).toBeDefined();
    expect(secondResult.jobId).not.toBe(firstResult.jobId);
    expect(memoryJobQueue.listJobs()).toHaveLength(2);
    expect(memoryJobQueue.listJobs()[1]?.idempotencyKey).toBe(
      `${orgId}:${versionId}:distribute:${correlationId}`,
    );
  });

  it('leaves client-managed Hashnode publications PENDING and does not enqueue a worker job', async () => {
    mockDestination.type = 'hashnode';
    mockDestination.config = { hashnodePublishMode: 'extension', publicationId: 'hn-pub' };

    const result = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );

    expect(result.publications).toHaveLength(1);
    expect(result.publications[0]?.status).toBe('PENDING');
    expect(result.jobId).toBeUndefined();
    expect(memoryJobQueue.listJobs()).toHaveLength(0);
    expect(mockPubRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationId: destId,
        status: 'PENDING',
      }),
    );
    expect(mockPubEventRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'CREATED',
      }),
    );
  });

  it('enqueues only API destinations when Hashnode is configured for a client-managed mode', async () => {
    const hashnodeDestId = '00000000-0000-0000-0000-000000000099';
    const hashnodeDest: Destination = {
      ...mockDestination,
      id: hashnodeDestId,
      type: 'hashnode',
      name: 'Hashnode',
      config: { hashnodePublishMode: 'hn_new' },
    };

    (mockDestRepo.findForOrganization as ReturnType<typeof vi.fn>).mockImplementation(
      async (org: string, id: string) => {
        if (org !== orgId) return null;
        if (id === destId) return { ...mockDestination };
        if (id === hashnodeDestId) return { ...hashnodeDest };
        return null;
      },
    );

    const result = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId, hashnodeDestId] },
    );

    expect(result.publications).toHaveLength(2);
    expect(result.jobId).toBeDefined();
    expect(memoryJobQueue.listJobs()).toHaveLength(1);
    expect(memoryJobQueue.listJobs()[0]?.payload?.destinationIds).toEqual([destId]);
    expect(memoryJobQueue.listJobs()[0]?.payload?.publicationIds).toHaveLength(1);
  });

  it('leaves client-managed Medium publications PENDING and does not enqueue a worker job', async () => {
    mockDestination.type = 'medium';
    mockDestination.config = { mediumPublishMode: 'extension' };

    const result = await service.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );

    expect(result.publications).toHaveLength(1);
    expect(result.publications[0]?.status).toBe('PENDING');
    expect(result.jobId).toBeUndefined();
    expect(memoryJobQueue.listJobs()).toHaveLength(0);
  });
});
