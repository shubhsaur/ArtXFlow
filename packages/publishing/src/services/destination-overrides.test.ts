import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PublishArticleService } from './publish-article.service';
import { PublicationService } from './publication.service';
import { MemoryJobQueue } from '../queue/memory-job-queue';
import type {
  Article,
  ArticleVersion,
  Destination,
  Publication,
  ArticleRepository,
  ArticleVersionRepository,
  DestinationRepository,
  PublicationRepository,
  PublicationEventRepository,
  SiteRepository,
  OrganizationRepository,
} from '@artxflow/database';

describe('Destination Overrides in Publishing', () => {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = 'user-test-123';
  const articleId = '00000000-0000-0000-0000-000000000002';
  const versionId = '00000000-0000-0000-0000-000000000003';
  const destId = '00000000-0000-0000-0000-000000000004';
  const devtoDestId = '00000000-0000-0000-0000-000000000005';

  let mockArticle: Article;
  let mockVersion: ArticleVersion;
  let mockDestination: Destination;
  let mockDevtoDestination: Destination;
  let mockPublication: Publication;

  let mockArticleRepo: ArticleRepository;
  let mockArticleVersionRepo: ArticleVersionRepository;
  let mockDestRepo: DestinationRepository;
  let mockPubRepo: PublicationRepository;
  let mockPubEventRepo: PublicationEventRepository;
  let mockSiteRepo: SiteRepository;
  let mockOrgRepo: OrganizationRepository;
  let memoryJobQueue: MemoryJobQueue;

  beforeEach(() => {
    mockArticle = {
      id: articleId,
      organizationId: orgId,
      authorId: userId,
      title: 'Original Title',
      slug: 'original-title',
      excerpt: 'Original Excerpt',
      status: 'READY',
      coverAssetId: null,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockVersion = {
      id: versionId,
      articleId,
      versionNumber: 1,
      content: '# Heading\nArticle body markdown.',
      contentFormat: 'markdown',
      metadata: {},
      createdBy: userId,
      createdAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockDestination = {
      id: destId,
      organizationId: orgId,
      type: 'ARTXFLOW_BLOG',
      name: 'Blog',
      connectionId: null,
      siteId: 'site-1',
      config: {},
      status: 'ACTIVE',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };

    mockDevtoDestination = {
      id: devtoDestId,
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

    mockPublication = {
      id: 'pub-1',
      organizationId: orgId,
      articleId,
      articleVersionId: versionId,
      destinationId: devtoDestId,
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
        if (id === destId) return { ...mockDestination };
        if (id === devtoDestId) return { ...mockDevtoDestination };
        return null;
      }),
      listByOrganization: vi.fn().mockResolvedValue([mockDestination, mockDevtoDestination]),
    } as unknown as DestinationRepository;

    mockPubRepo = {
      findByVersionAndDestination: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => ({
        ...mockPublication,
        ...data,
      })),
      findForOrganization: vi.fn().mockResolvedValue(mockPublication),
      updateStatus: vi
        .fn()
        .mockImplementation(async (_id: string, _org: string, update: Record<string, unknown>) => ({
          ...mockPublication,
          ...update,
        })),
    } as unknown as PublicationRepository;

    mockPubEventRepo = {
      create: vi.fn().mockResolvedValue({ id: 'event-1' }),
    } as unknown as PublicationEventRepository;

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
  });

  describe('PublicationService overrides handling', () => {
    it('creates publication with overrides and returns them in DTO', async () => {
      const pubService = new PublicationService(
        mockDestRepo,
        mockPubRepo,
        mockPubEventRepo,
        mockSiteRepo,
        mockArticleRepo,
        mockArticleVersionRepo,
      );

      const result = await pubService.createPublication(
        { userId, organizationId: orgId },
        {
          articleId,
          articleVersionId: versionId,
          destinationId: devtoDestId,
          overrides: {
            title: 'Overridden Title for DEV.to',
            tags: ['typescript', 'react'],
          },
        },
      );

      expect(mockPubRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: orgId,
          articleId,
          articleVersionId: versionId,
          destinationId: devtoDestId,
          overrides: {
            title: 'Overridden Title for DEV.to',
            tags: ['typescript', 'react'],
          },
        }),
      );

      expect(result.overrides).toEqual({
        title: 'Overridden Title for DEV.to',
        tags: ['typescript', 'react'],
      });
    });

    it('updates publication status and overrides', async () => {
      const pubService = new PublicationService(
        mockDestRepo,
        mockPubRepo,
        mockPubEventRepo,
        mockSiteRepo,
        mockArticleRepo,
        mockArticleVersionRepo,
      );

      await pubService.updatePublicationStatus(
        { userId, organizationId: orgId },
        {
          publicationId: 'pub-1',
          status: 'QUEUED',
          overrides: {
            title: 'Updated Overridden Title',
          },
        },
      );

      expect(mockPubRepo.updateStatus).toHaveBeenCalledWith(
        'pub-1',
        orgId,
        expect.objectContaining({
          status: 'QUEUED',
          overrides: {
            title: 'Updated Overridden Title',
          },
        }),
      );
    });
  });

  describe('PublishArticleService with destinationOverrides', () => {
    it('passes destination overrides to created publication records when publishing', async () => {
      const publishService = new PublishArticleService({
        articleRepo: mockArticleRepo,
        articleVersionRepo: mockArticleVersionRepo,
        destinationRepo: mockDestRepo,
        publicationRepo: mockPubRepo,
        publicationEventRepo: mockPubEventRepo,
        siteRepo: mockSiteRepo,
        orgRepo: mockOrgRepo,
        jobQueue: memoryJobQueue,
      });

      const result = await publishService.publishArticle(
        { userId, organizationId: orgId },
        {
          articleId,
          destinationIds: [devtoDestId],
          destinationOverrides: {
            [devtoDestId]: {
              title: 'Special DEV.to Headline',
              tags: ['devto', 'webdev'],
              canonicalUrl: 'https://canonical.example.com/art-1',
            },
          },
        },
      );

      expect(mockPubRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          destinationId: devtoDestId,
          overrides: {
            title: 'Special DEV.to Headline',
            tags: ['devto', 'webdev'],
            canonicalUrl: 'https://canonical.example.com/art-1',
          },
        }),
      );

      expect(result.publications).toHaveLength(1);
      expect(result.publications[0].overrides).toEqual({
        title: 'Special DEV.to Headline',
        tags: ['devto', 'webdev'],
        canonicalUrl: 'https://canonical.example.com/art-1',
      });
    });

    it('updates overrides on an existing uncompleted publication on republish', async () => {
      const existingPublication: Publication = {
        ...mockPublication,
        status: 'FAILED',
        overrides: { title: 'Old Title' },
      };
      vi.mocked(mockPubRepo.findByVersionAndDestination).mockResolvedValue(existingPublication);

      const publishService = new PublishArticleService({
        articleRepo: mockArticleRepo,
        articleVersionRepo: mockArticleVersionRepo,
        destinationRepo: mockDestRepo,
        publicationRepo: mockPubRepo,
        publicationEventRepo: mockPubEventRepo,
        siteRepo: mockSiteRepo,
        orgRepo: mockOrgRepo,
        jobQueue: memoryJobQueue,
      });

      await publishService.publishArticle(
        { userId, organizationId: orgId },
        {
          articleId,
          destinationIds: [devtoDestId],
          destinationOverrides: {
            [devtoDestId]: {
              title: 'New Corrected Title',
              tags: ['javascript'],
            },
          },
        },
      );

      expect(mockPubRepo.updateStatus).toHaveBeenCalledWith(
        existingPublication.id,
        orgId,
        expect.objectContaining({
          status: 'QUEUED',
          overrides: {
            title: 'New Corrected Title',
            tags: ['javascript'],
          },
        }),
      );
    });
  });
});
