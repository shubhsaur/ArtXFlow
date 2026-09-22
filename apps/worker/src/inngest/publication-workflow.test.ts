import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publicationRequested } from './functions/publication';
import {
  publicationRepository,
  publicationEventRepository,
  destinationRepository,
  articleRepository,
  articleVersionRepository,
  type Publication,
  type Destination,
  type Article,
  type ArticleVersion,
  type PublicationEvent,
} from '@artxflow/database';
import { platformConnectionService } from '@artxflow/publishing';
import { devtoAdapter, PlatformError } from '@artxflow/platform-adapters';
import { NonRetriableError } from 'inngest';

describe('Worker Publication Workflow with External Platform (DEV.to)', () => {
  const orgId = '11111111-1111-1111-1111-111111111111';
  const pubId = 'pub-uuid-1';
  const articleId = 'art-uuid-1';
  const versionId = 'ver-uuid-1';
  const connId = 'conn-uuid-1';
  const destId = 'dest-uuid-1';

  const mockPublication: Publication = {
    id: pubId,
    organizationId: orgId,
    articleId,
    articleVersionId: versionId,
    destinationId: destId,
    status: 'QUEUED',
    attemptCount: 0,
    externalResourceId: null,
    externalUrl: null,
    publishedAt: null,
    lastAttemptAt: null,
    lastErrorCode: null,
    lastErrorMessage: null,
    overrides: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockDestination: Destination = {
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

  const mockArticle: Article = {
    id: articleId,
    organizationId: orgId,
    title: 'Cross-Posting with ArtXFlow',
    excerpt: 'How to distribute content seamlessly.',
    slug: 'cross-posting',
    status: 'DRAFT',
    coverAssetId: null,
    authorId: 'user-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion: ArticleVersion = {
    id: versionId,
    articleId,
    versionNumber: 1,
    content: '# Hello from ArtXFlow\n\nCross posting to DEV.to.',
    contentFormat: 'markdown',
    metadata: {},
    createdBy: 'user-1',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockEvent: PublicationEvent = {
    id: 'evt-1',
    publicationId: pubId,
    eventType: 'SUCCEEDED',
    correlationId: 'corr-1',
    metadata: {},
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(publicationRepository, 'findForOrganization').mockResolvedValue(mockPublication);
    vi.spyOn(publicationRepository, 'updateStatus').mockResolvedValue(mockPublication);
    vi.spyOn(publicationEventRepository, 'create').mockResolvedValue(mockEvent);
    vi.spyOn(destinationRepository, 'findForOrganization').mockResolvedValue(mockDestination);
    vi.spyOn(articleRepository, 'findById').mockResolvedValue(mockArticle);
    vi.spyOn(articleVersionRepository, 'findById').mockResolvedValue(mockVersion);
    // Default: no previously published copy exists (fresh publish path).
    vi.spyOn(
      publicationRepository,
      'findLatestPublishedForArticleAndDestination',
    ).mockResolvedValue(null);
    vi.spyOn(platformConnectionService, 'getDecryptedSecret').mockResolvedValue(
      'decrypted_devto_key_123',
    );
  });

  // Helper simulating Inngest execution step runner
  const createMockInngestContext = () => ({
    event: {
      name: 'artxflow/publication.requested',
      data: {
        publicationId: pubId,
        organizationId: orgId,
        correlationId: 'corr-1',
        idempotencyKey: 'idemp-1',
      },
    },
    step: {
      run: vi.fn().mockImplementation(async (_name, fn) => fn()),
    },
  });

  type InngestHandler = {
    fn: (
      ctx: ReturnType<typeof createMockInngestContext>,
    ) => Promise<{
      status: string;
      publicationId: string;
      externalUrl?: string | null;
      mode?: 'CREATE' | 'UPDATE';
    }>;
  };
  const executeHandler = (publicationRequested as unknown as InngestHandler).fn;

  it('publishes article to DEV.to, stores remote identity, and records SUCCEEDED event', async () => {
    vi.spyOn(devtoAdapter, 'publish').mockResolvedValueOnce({
      externalResourceId: '98765',
      externalUrl: 'https://dev.to/alice/cross-posting-98765',
      publishedAt: '2026-09-13T16:30:00Z',
    });

    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(platformConnectionService.getDecryptedSecret).toHaveBeenCalledWith(
      { userId: 'system', organizationId: orgId },
      connId,
    );

    expect(devtoAdapter.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        credentials: {
          apiKey: 'decrypted_devto_key_123',
          token: 'decrypted_devto_key_123',
        },
      }),
    );

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'PUBLISHED',
        externalResourceId: '98765',
        externalUrl: 'https://dev.to/alice/cross-posting-98765',
      }),
    );

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'SUCCEEDED',
      }),
    );

    expect(result.status).toBe('PUBLISHED');
    expect(result.externalUrl).toBe('https://dev.to/alice/cross-posting-98765');
  });

  it('publishes article applying title, tags, and description overrides while preserving canonical content', async () => {
    vi.spyOn(publicationRepository, 'findForOrganization').mockResolvedValueOnce({
      ...mockPublication,
      overrides: {
        title: 'Custom Title Specifically For DEV.to',
        description: 'Overridden custom summary',
        tags: ['webdev', 'beginners', 'typescript'],
        canonicalUrl: 'https://canonical.custom.org/p/123',
      },
    });

    const publishSpy = vi.spyOn(devtoAdapter, 'publish').mockResolvedValueOnce({
      externalResourceId: '55555',
      externalUrl: 'https://dev.to/alice/custom-title-specifically-for-dev-to-55555',
      publishedAt: '2026-09-13T17:00:00Z',
    });

    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        article: expect.objectContaining({
          title: 'Custom Title Specifically For DEV.to',
          description: 'Overridden custom summary',
          tags: ['webdev', 'beginners', 'typescript'],
          canonicalUrl: 'https://canonical.custom.org/p/123',
          // Invariant: markdown content remains unchanged
          content: mockVersion.content,
        }),
      }),
    );

    expect(result.status).toBe('PUBLISHED');
  });

  it('updates the previously published DEV.to article instead of creating a duplicate', async () => {
    vi.spyOn(
      publicationRepository,
      'findLatestPublishedForArticleAndDestination',
    ).mockResolvedValueOnce({
      ...mockPublication,
      id: 'pub-uuid-previous',
      status: 'PUBLISHED',
      externalResourceId: '98765',
      externalUrl: 'https://dev.to/alice/cross-posting-98765',
      publishedAt: new Date('2026-09-01T00:00:00Z'),
    });

    const publishSpy = vi.spyOn(devtoAdapter, 'publish');
    const updateSpy = vi.spyOn(devtoAdapter, 'update').mockResolvedValueOnce({
      externalResourceId: '98765',
      externalUrl: 'https://dev.to/alice/cross-posting-98765',
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    // Reuses the existing remote id rather than publishing a second article
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        externalResourceId: '98765',
        credentials: {
          apiKey: 'decrypted_devto_key_123',
          token: 'decrypted_devto_key_123',
        },
      }),
    );
    expect(publishSpy).not.toHaveBeenCalled();

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'PUBLISHED',
        externalResourceId: '98765',
        externalUrl: 'https://dev.to/alice/cross-posting-98765',
      }),
    );

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'SUCCEEDED',
        metadata: expect.objectContaining({
          mode: 'UPDATE',
          updatedExternalResourceId: '98765',
        }),
      }),
    );

    expect(result.status).toBe('PUBLISHED');
    expect(result.mode).toBe('UPDATE');
  });

  it('creates a new post and flags the duplicate when the platform cannot update published content', async () => {
    vi.spyOn(
      publicationRepository,
      'findLatestPublishedForArticleAndDestination',
    ).mockResolvedValueOnce({
      ...mockPublication,
      id: 'pub-uuid-previous',
      status: 'PUBLISHED',
      externalResourceId: '98765',
      externalUrl: 'https://dev.to/alice/cross-posting-98765',
      publishedAt: new Date('2026-09-01T00:00:00Z'),
    });

    // Simulate a platform such as Medium, whose API has no update endpoint.
    vi.spyOn(devtoAdapter, 'getCapabilities').mockReturnValueOnce({
      create: true,
      update: false,
      delete: false,
      analytics: false,
      canonicalUrl: true,
      images: false,
      scheduling: false,
    });

    const updateSpy = vi.spyOn(devtoAdapter, 'update');
    const publishSpy = vi.spyOn(devtoAdapter, 'publish').mockResolvedValueOnce({
      externalResourceId: '99999',
      externalUrl: 'https://dev.to/alice/cross-posting-99999',
      publishedAt: '2026-09-20T10:00:00Z',
    });

    const ctx = createMockInngestContext();
    const result = await executeHandler(ctx);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(publishSpy).toHaveBeenCalled();

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'SUCCEEDED',
        metadata: expect.objectContaining({
          mode: 'CREATE',
          duplicateOf: '98765',
        }),
      }),
    );

    expect(result.mode).toBe('CREATE');
  });

  it('handles rate limiting (429) as retryable failure, setting status to RETRYING', async () => {
    vi.spyOn(devtoAdapter, 'publish').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'RATE_LIMITED',
        message: 'Rate limit reached',
        statusCode: 429,
        retryable: true,
      }),
    );

    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(PlatformError);

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'RETRYING',
        lastErrorCode: 'RATE_LIMITED',
      }),
    );

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'RETRY_SCHEDULED',
      }),
    );
  });

  it('handles invalid credentials (401) as non-retryable failure, throwing NonRetriableError', async () => {
    vi.spyOn(devtoAdapter, 'publish').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'AUTHENTICATION_ERROR',
        message: 'Unauthorized',
        statusCode: 401,
        retryable: false,
      }),
    );

    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'FAILED',
        lastErrorCode: 'AUTHENTICATION_ERROR',
      }),
    );

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'FAILED',
      }),
    );
  });

  it('skips duplicate execution if publication is already PUBLISHED (idempotency guard)', async () => {
    vi.spyOn(publicationRepository, 'findForOrganization').mockResolvedValueOnce({
      ...mockPublication,
      status: 'PUBLISHED',
      externalResourceId: 'already-published-id',
      externalUrl: 'https://dev.to/already-published',
    });

    const publishSpy = vi.spyOn(devtoAdapter, 'publish');
    const ctx = createMockInngestContext();

    const result = await executeHandler(ctx);

    expect(publishSpy).not.toHaveBeenCalled();
    expect(result.externalUrl).toBe('https://dev.to/already-published');
  });

  it('stops retrying when bounded retries are exhausted (attempt >= 3)', async () => {
    vi.spyOn(devtoAdapter, 'publish').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'NETWORK_ERROR',
        message: 'Network connection reset',
        retryable: true,
      }),
    );

    const ctx = {
      ...createMockInngestContext(),
      attempt: 3,
    };

    await expect(
      (publicationRequested as unknown as { fn: (ctx: unknown) => Promise<unknown> }).fn(ctx),
    ).rejects.toThrow(NonRetriableError);

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'FAILED',
        lastErrorCode: 'MAX_RETRIES_EXCEEDED',
      }),
    );
  });

  it('handles UNKNOWN_OUTCOME explicitly: marks status UNKNOWN_OUTCOME and prevents automatic blind retries', async () => {
    vi.spyOn(devtoAdapter, 'publish').mockRejectedValueOnce(
      new PlatformError({
        provider: 'DEVTO',
        code: 'UNKNOWN_OUTCOME',
        message: 'Request timed out during article creation. Remote state is unknown.',
        retryable: false,
      }),
    );

    const ctx = createMockInngestContext();

    await expect(executeHandler(ctx)).rejects.toThrow(NonRetriableError);

    expect(publicationRepository.updateStatus).toHaveBeenCalledWith(
      pubId,
      orgId,
      expect.objectContaining({
        status: 'UNKNOWN_OUTCOME',
        lastErrorCode: 'UNKNOWN_OUTCOME',
      }),
    );

    expect(publicationEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        publicationId: pubId,
        eventType: 'UNKNOWN_OUTCOME',
      }),
    );
  });
});
