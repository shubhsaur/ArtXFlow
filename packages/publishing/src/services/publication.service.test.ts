import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PublicationService,
  type CommandContext,
  type CreateDestinationInput,
  type CreatePublicationInput,
} from './publication.service';
import { MemoryJobQueue } from '../queue/memory-job-queue';
import {
  DuplicatePublicationError,
  DestinationNotFoundError,
  InvalidDestinationConfigurationError,
  PublicationNotFoundError,
  PublishingError,
} from '../errors';
import type {
  Destination,
  Publication,
  PublicationEvent,
  Site,
  Article,
  ArticleVersion,
  DestinationRepository,
  PublicationRepository,
  PublicationEventRepository,
  SiteRepository,
  ArticleRepository,
  ArticleVersionRepository,
  PlatformConnectionRepository,
} from '@artxflow/database';

describe('PublicationService', () => {
  const org1Id = '11111111-1111-1111-1111-111111111111';
  const org2Id = '22222222-2222-2222-2222-222222222222';
  const userId = 'user-uuid-1';
  const siteId = 'site-uuid-1';
  const articleId = 'article-uuid-1';
  const versionId = 'version-uuid-1';
  const destId = 'dest-uuid-1';

  const ctx: CommandContext = {
    userId,
    organizationId: org1Id,
    correlationId: 'corr-test-123',
  };

  const mockSite: Site = {
    id: siteId,
    organizationId: org1Id,
    name: 'Acme Blog',
    subdomain: 'acme-blog',
    customDomain: null,
    status: 'ACTIVE',
    themeConfig: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockArticle: Article = {
    id: articleId,
    organizationId: org1Id,
    authorId: userId,
    title: 'Distributed Publishing with ArtXFlow',
    slug: 'distributed-publishing-with-artxflow',
    excerpt: 'An overview of multi-platform distribution',
    status: 'READY',
    coverAssetId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion: ArticleVersion = {
    id: versionId,
    articleId,
    versionNumber: 1,
    content: '# Distributed Publishing',
    contentFormat: 'markdown',
    metadata: {},
    createdBy: userId,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockDestination: Destination = {
    id: destId,
    organizationId: org1Id,
    type: 'SITE',
    name: 'Acme Official Blog',
    connectionId: null,
    siteId,
    config: {},
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockPublication: Publication = {
    id: 'pub-uuid-1',
    organizationId: org1Id,
    articleId,
    articleVersionId: versionId,
    destinationId: destId,
    status: 'PENDING',
    externalResourceId: null,
    externalUrl: null,
    publishedAt: null,
    lastAttemptAt: null,
    attemptCount: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    overrides: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockEvent: PublicationEvent = {
    id: 'event-uuid-1',
    publicationId: mockPublication.id,
    eventType: 'CREATED',
    correlationId: 'corr-test-123',
    metadata: {
      articleId,
      articleVersionId: versionId,
      destinationId: destId,
      destinationType: 'SITE',
    },
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  let mockDestinationRepo: DestinationRepository;
  let mockPublicationRepo: PublicationRepository;
  let mockPublicationEventRepo: PublicationEventRepository;
  let mockSiteRepo: SiteRepository;
  let mockArticleRepo: ArticleRepository;
  let mockArticleVersionRepo: ArticleVersionRepository;
  let service: PublicationService;

  beforeEach(() => {
    mockDestinationRepo = {
      create: vi.fn().mockResolvedValue(mockDestination),
      findForOrganization: vi.fn().mockImplementation(async (orgId: string, id: string) => {
        if (orgId === org1Id && id === destId) return mockDestination;
        return null;
      }),
      listByOrganization: vi.fn().mockResolvedValue([mockDestination]),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as DestinationRepository;

    mockPublicationRepo = {
      create: vi.fn().mockResolvedValue(mockPublication),
      findForOrganization: vi.fn().mockImplementation(async (orgId: string, id: string) => {
        if (orgId === org1Id && id === mockPublication.id) return mockPublication;
        return null;
      }),
      findByVersionAndDestination: vi.fn().mockResolvedValue(null),
      listByArticle: vi.fn().mockResolvedValue([mockPublication]),
      listByArticleVersion: vi.fn().mockResolvedValue([mockPublication]),
      updateStatus: vi.fn().mockImplementation(async (_id, _orgId, data) => ({
        ...mockPublication,
        ...data,
        updatedAt: new Date('2026-01-01T01:00:00Z'),
      })),
    } as unknown as PublicationRepository;

    mockPublicationEventRepo = {
      create: vi.fn().mockResolvedValue(mockEvent),
      listByPublication: vi.fn().mockResolvedValue([mockEvent]),
      listByCorrelationId: vi.fn().mockResolvedValue([mockEvent]),
    } as unknown as PublicationEventRepository;

    mockSiteRepo = {
      findSiteForOrganization: vi.fn().mockImplementation(async (orgId: string, id: string) => {
        if (orgId === org1Id && id === siteId) return mockSite;
        return null;
      }),
    } as unknown as SiteRepository;

    mockArticleRepo = {
      findArticleForOrganization: vi.fn().mockImplementation(async (orgId: string, id: string) => {
        if (orgId === org1Id && id === articleId) return mockArticle;
        return null;
      }),
    } as unknown as ArticleRepository;

    mockArticleVersionRepo = {
      findForArticle: vi.fn().mockImplementation(async (artId: string, vId: string) => {
        if (artId === articleId && vId === versionId) return mockVersion;
        return null;
      }),
    } as unknown as ArticleVersionRepository;

    const mockConnectionRepo = {
      findForOrganization: vi.fn().mockResolvedValue(null),
    } as unknown as PlatformConnectionRepository;

    const memoryJobQueue = new MemoryJobQueue();

    service = new PublicationService(
      mockDestinationRepo,
      mockPublicationRepo,
      mockPublicationEventRepo,
      mockSiteRepo,
      mockArticleRepo,
      mockArticleVersionRepo,
      mockConnectionRepo,
      memoryJobQueue,
    );
  });

  describe('Destination Management', () => {
    it('creates a destination successfully and converts to DTO', async () => {
      const input: CreateDestinationInput = {
        type: 'SITE',
        name: 'Acme Official Blog',
        siteId,
      };

      const result = await service.createDestination(ctx, input);

      expect(result.id).toBe(mockDestination.id);
      expect(result.name).toBe('Acme Official Blog');
      expect(typeof result.createdAt).toBe('string'); // Safe DTO serialization
      expect(mockSiteRepo.findSiteForOrganization).toHaveBeenCalledWith(org1Id, siteId);
      expect(mockDestinationRepo.create).toHaveBeenCalled();
    });

    it('rejects destination creation if referenced site belongs to another organization', async () => {
      vi.mocked(mockSiteRepo.findSiteForOrganization).mockResolvedValueOnce(null);

      const input: CreateDestinationInput = {
        type: 'SITE',
        name: 'Attacker Blog',
        siteId: 'foreign-site-id',
      };

      await expect(service.createDestination(ctx, input)).rejects.toThrow(
        InvalidDestinationConfigurationError,
      );
    });

    it('enforces tenant boundary when retrieving destination', async () => {
      const wrongOrgCtx: CommandContext = { ...ctx, organizationId: org2Id };

      await expect(service.getDestination(wrongOrgCtx, destId)).rejects.toThrow(
        DestinationNotFoundError,
      );
    });
  });

  describe('Publication Creation & Uniqueness', () => {
    it('creates publication and writes an initial append-only event', async () => {
      const input: CreatePublicationInput = {
        articleId,
        articleVersionId: versionId,
        destinationId: destId,
      };

      const result = await service.createPublication(ctx, input);

      expect(result.id).toBe(mockPublication.id);
      expect(result.status).toBe('PENDING');
      expect(typeof result.createdAt).toBe('string');
      expect(mockPublicationEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicationId: mockPublication.id,
          eventType: 'CREATED',
          correlationId: 'corr-test-123',
        }),
      );
    });

    it('enforces uniqueness: rejects duplicate publication for same version and destination', async () => {
      vi.mocked(mockPublicationRepo.findByVersionAndDestination).mockResolvedValueOnce(
        mockPublication,
      );

      const input: CreatePublicationInput = {
        articleId,
        articleVersionId: versionId,
        destinationId: destId,
      };

      await expect(service.createPublication(ctx, input)).rejects.toThrow(
        DuplicatePublicationError,
      );
      expect(mockPublicationRepo.create).not.toHaveBeenCalled();
    });

    it('rejects publication creation if destination belongs to another organization', async () => {
      vi.mocked(mockDestinationRepo.findForOrganization).mockResolvedValueOnce(null);

      const input: CreatePublicationInput = {
        articleId,
        articleVersionId: versionId,
        destinationId: 'cross-tenant-dest-id',
      };

      await expect(service.createPublication(ctx, input)).rejects.toThrow(DestinationNotFoundError);
    });

    it('rejects publication creation if article does not belong to organization', async () => {
      vi.mocked(mockArticleRepo.findArticleForOrganization).mockResolvedValueOnce(null);

      const input: CreatePublicationInput = {
        articleId: 'cross-tenant-article-id',
        articleVersionId: versionId,
        destinationId: destId,
      };

      await expect(service.createPublication(ctx, input)).rejects.toThrow(PublishingError);
    });
  });

  describe('Publication Lifecycle & Append-Only Events', () => {
    it('updates publication status to PUBLISHED and logs SUCCEEDED event', async () => {
      const result = await service.updatePublicationStatus(ctx, {
        publicationId: mockPublication.id,
        status: 'PUBLISHED',
        externalResourceId: 'devto-12345',
        externalUrl: 'https://dev.to/acme/distributed-publishing',
        publishedAt: new Date('2026-01-01T01:00:00Z'),
      });

      expect(result.status).toBe('PUBLISHED');
      expect(result.externalResourceId).toBe('devto-12345');
      expect(result.externalUrl).toBe('https://dev.to/acme/distributed-publishing');

      expect(mockPublicationEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicationId: mockPublication.id,
          eventType: 'SUCCEEDED',
          metadata: expect.objectContaining({
            previousStatus: 'PENDING',
            newStatus: 'PUBLISHED',
            externalResourceId: 'devto-12345',
          }),
        }),
      );
    });

    it('updates publication status to FAILED and logs error event', async () => {
      const result = await service.updatePublicationStatus(ctx, {
        publicationId: mockPublication.id,
        status: 'FAILED',
        lastErrorCode: 'RATE_LIMITED',
        lastErrorMessage: 'Provider API returned HTTP 429',
      });

      expect(result.status).toBe('FAILED');
      expect(mockPublicationEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicationId: mockPublication.id,
          eventType: 'FAILED',
          metadata: expect.objectContaining({
            previousStatus: 'PENDING',
            newStatus: 'FAILED',
            errorCode: 'RATE_LIMITED',
            errorMessage: 'Provider API returned HTTP 429',
          }),
        }),
      );
    });

    it('enforces tenant boundary on retrieving publication history', async () => {
      const wrongOrgCtx: CommandContext = { ...ctx, organizationId: org2Id };

      await expect(service.getPublicationHistory(wrongOrgCtx, mockPublication.id)).rejects.toThrow(
        PublicationNotFoundError,
      );
    });
  });

  describe('Manual Retry & Distribution Status', () => {
    it('manually retries a failed publication: resets status to QUEUED, logs event, and enqueues job', async () => {
      vi.mocked(mockPublicationRepo.findForOrganization).mockResolvedValueOnce({
        ...mockPublication,
        status: 'FAILED',
        lastErrorCode: 'NETWORK_ERROR',
        lastErrorMessage: 'Connection timeout',
      });

      const result = await service.retryPublication(ctx, mockPublication.id);

      expect(result.status).toBe('QUEUED');
      expect(mockPublicationRepo.updateStatus).toHaveBeenCalledWith(
        mockPublication.id,
        org1Id,
        expect.objectContaining({
          status: 'QUEUED',
          lastErrorCode: null,
          lastErrorMessage: null,
        }),
      );

      expect(mockPublicationEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          publicationId: mockPublication.id,
          eventType: 'QUEUED',
          metadata: expect.objectContaining({
            previousStatus: 'FAILED',
            newStatus: 'QUEUED',
            reason: 'Manual retry requested',
          }),
        }),
      );
    });

    it('manually retries an UNKNOWN_OUTCOME publication', async () => {
      vi.mocked(mockPublicationRepo.findForOrganization).mockResolvedValueOnce({
        ...mockPublication,
        status: 'UNKNOWN_OUTCOME',
        lastErrorCode: 'UNKNOWN_OUTCOME',
      });

      const result = await service.retryPublication(ctx, mockPublication.id);
      expect(result.status).toBe('QUEUED');
    });

    it('rejects retrying an already PUBLISHED publication', async () => {
      vi.mocked(mockPublicationRepo.findForOrganization).mockResolvedValueOnce({
        ...mockPublication,
        status: 'PUBLISHED',
      });

      await expect(service.retryPublication(ctx, mockPublication.id)).rejects.toThrow(
        /already published and cannot be retried/,
      );
    });

    it('rejects retrying a currently PUBLISHING publication', async () => {
      vi.mocked(mockPublicationRepo.findForOrganization).mockResolvedValueOnce({
        ...mockPublication,
        status: 'PUBLISHING',
      });

      await expect(service.retryPublication(ctx, mockPublication.id)).rejects.toThrow(
        /currently executing and cannot be retried/,
      );
    });

    it('computes aggregate distribution status for an article version', async () => {
      vi.mocked(mockPublicationRepo.listByArticleVersion).mockResolvedValueOnce([
        { ...mockPublication, status: 'PUBLISHED' },
        { ...mockPublication, id: 'pub-2', status: 'FAILED' },
      ]);

      const status = await service.getDistributionStatusForArticleVersion(ctx, versionId);
      expect(status).toBe('PARTIALLY_PUBLISHED');
    });
  });
});
