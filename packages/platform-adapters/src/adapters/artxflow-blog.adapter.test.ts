import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArtXFlowBlogAdapter } from './artxflow-blog.adapter';
import { platformAdapterRegistry, getPlatformAdapter } from '../registry';
import { PlatformError } from '../errors';
import type { CanonicalArticle, PlatformArticle } from '../contract';
import type {
  Article,
  ArticleRepository,
  Site,
  SiteRepository,
  ArticleVersionRepository,
} from '@artxflow/database';

describe('ArtXFlowBlogAdapter', () => {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const articleId = '00000000-0000-0000-0000-000000000002';
  const versionId = '00000000-0000-0000-0000-000000000003';
  const siteId = '00000000-0000-0000-0000-000000000004';
  const pubId = '00000000-0000-0000-0000-000000000005';

  let mockArticle: Article;
  let mockSite: Site;
  let mockArticleRepo: ArticleRepository;
  let mockSiteRepo: SiteRepository;
  let mockVersionRepo: ArticleVersionRepository;
  let adapter: ArtXFlowBlogAdapter;

  beforeEach(() => {
    mockArticle = {
      id: articleId,
      organizationId: orgId,
      authorId: 'user-1',
      title: 'Architecting Distributed Systems',
      slug: 'architecting-distributed-systems',
      excerpt: 'A deep dive into distributed systems.',
      status: 'DRAFT',
      coverAssetId: null,
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

    mockArticleRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => {
        return id === mockArticle.id ? { ...mockArticle } : null;
      }),
      findBySlug: vi.fn(),
      findPublishedBySlug: vi.fn().mockImplementation(async (_org: string, slug: string) => {
        if (mockArticle.slug === slug && mockArticle.status === 'READY') {
          return { ...mockArticle };
        }
        return null;
      }),
      listByOrganization: vi.fn().mockResolvedValue([mockArticle]),
      listPublishedByOrganization: vi.fn().mockImplementation(async () => {
        return mockArticle.status === 'READY' ? [{ ...mockArticle }] : [];
      }),
      createWithInitialVersion: vi.fn(),
      update: vi.fn().mockImplementation(async (id: string, data: Partial<Article>) => {
        if (id === mockArticle.id) {
          Object.assign(mockArticle, data, { updatedAt: new Date() });
          return { ...mockArticle };
        }
        return null;
      }),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as ArticleRepository;

    mockSiteRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => {
        return id === mockSite.id ? { ...mockSite } : null;
      }),
      findBySubdomain: vi.fn().mockImplementation(async (subdomain: string) => {
        return mockSite.subdomain === subdomain.toLowerCase() ? { ...mockSite } : null;
      }),
      findByCustomDomain: vi.fn().mockImplementation(async (domain: string) => {
        return mockSite.customDomain === domain.toLowerCase() ? { ...mockSite } : null;
      }),
      findSiteForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        return mockSite.organizationId === org && mockSite.id === id ? { ...mockSite } : null;
      }),
      listByOrganization: vi.fn().mockResolvedValue([mockSite]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(true),
    } as unknown as SiteRepository;

    mockVersionRepo = {
      getLatestVersion: vi.fn(),
      listByArticle: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    } as unknown as ArticleVersionRepository;

    adapter = new ArtXFlowBlogAdapter({
      articleRepo: mockArticleRepo,
      siteRepo: mockSiteRepo,
      versionRepo: mockVersionRepo,
    });
  });

  describe('Contract & Capabilities', () => {
    it('declares provider as ARTXFLOW_BLOG', () => {
      expect(adapter.provider).toBe('ARTXFLOW_BLOG');
    });

    it('declares full first-party platform capabilities', () => {
      const caps = adapter.getCapabilities();
      expect(caps).toEqual({
        create: true,
        update: true,
        delete: true,
        analytics: true,
        canonicalUrl: true,
        images: true,
        scheduling: true,
      });
    });
  });

  describe('Validation & Transformation', () => {
    it('validates a correct platform article', async () => {
      const article: PlatformArticle = {
        title: 'Building Modern Web Applications',
        content: '# Building Modern Web Applications\nContent goes here.',
        metadata: { articleId },
      };

      const result = await adapter.validate(article);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects an article with missing title, content, or articleId', async () => {
      const result = await adapter.validate({
        title: '',
        content: '',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
      expect(result.errors.some((e) => e.field === 'metadata.articleId')).toBe(true);
    });

    it('transforms canonical article into platform article preserving metadata', async () => {
      const canonical: CanonicalArticle = {
        id: articleId,
        versionId,
        title: 'Deploying with Inngest',
        excerpt: 'Durable background workflows.',
        markdown: '# Inngest\nStep functions.',
        coverImage: { id: 'asset-1', url: 'https://cdn.artxflow.com/cover.png' },
        tags: ['inngest', 'typescript'],
        canonicalUrl: 'https://blog.myorg.com/inngest',
      };

      const platformArticle = await adapter.transform(canonical);

      expect(platformArticle.title).toBe('Deploying with Inngest');
      expect(platformArticle.content).toBe('# Inngest\nStep functions.');
      expect(platformArticle.description).toBe('Durable background workflows.');
      expect(platformArticle.coverImageUrl).toBe('https://cdn.artxflow.com/cover.png');
      expect(platformArticle.tags).toEqual(['inngest', 'typescript']);
      expect(platformArticle.canonicalUrl).toBe('https://blog.myorg.com/inngest');
      expect(platformArticle.metadata).toEqual(
        expect.objectContaining({
          articleId,
          versionId,
        }),
      );
    });
  });

  describe('Publishing Behavior', () => {
    it('publishes a draft article and marks it as READY so it becomes publicly visible', async () => {
      expect(mockArticle.status).toBe('DRAFT');

      const publishResult = await adapter.publish({
        publicationId: pubId,
        article: {
          title: mockArticle.title,
          content: 'Full article body',
          metadata: { articleId, versionId },
        },
        destinationConfig: { siteId },
      });

      // Status transitioned to READY
      expect(mockArticleRepo.update).toHaveBeenCalledWith(articleId, { status: 'READY' });
      expect(mockArticle.status).toBe('READY');

      // External resource ID is the internal article ID
      expect(publishResult.externalResourceId).toBe(articleId);
      // External URL is the public site article route
      expect(publishResult.externalUrl).toBe('/sites/engineering/architecting-distributed-systems');
      expect(typeof publishResult.publishedAt).toBe('string');
      expect(publishResult.metadata?.siteId).toBe(siteId);
      expect(publishResult.metadata?.subdomain).toBe('engineering');
      expect(publishResult.metadata?.slug).toBe('architecting-distributed-systems');
    });

    it('respects customDomain when configured on the site', async () => {
      mockSite.customDomain = 'blog.engineering.co';

      const publishResult = await adapter.publish({
        publicationId: pubId,
        article: {
          title: mockArticle.title,
          content: 'Content',
          metadata: { articleId },
        },
        destinationConfig: { siteId },
      });

      expect(publishResult.externalUrl).toBe(
        'https://blog.engineering.co/architecting-distributed-systems',
      );
    });

    it('respects custom baseUrl when adapter is configured with one', async () => {
      const adapterWithBase = new ArtXFlowBlogAdapter({
        articleRepo: mockArticleRepo,
        siteRepo: mockSiteRepo,
        versionRepo: mockVersionRepo,
        baseUrl: 'https://artxflow.dev',
      });

      const publishResult = await adapterWithBase.publish({
        publicationId: pubId,
        article: {
          title: mockArticle.title,
          content: 'Content',
          metadata: { articleId },
        },
        destinationConfig: { siteId },
      });

      expect(publishResult.externalUrl).toBe(
        'https://artxflow.dev/sites/engineering/architecting-distributed-systems',
      );
    });

    it('handles duplicate publish idempotently without duplicate mutation', async () => {
      // First publish
      await adapter.publish({
        publicationId: pubId,
        article: {
          title: mockArticle.title,
          content: 'Content',
          metadata: { articleId },
        },
        destinationConfig: { siteId },
      });

      expect(mockArticle.status).toBe('READY');
      vi.clearAllMocks();

      // Second publish with same article (duplicate workflow trigger)
      const secondResult = await adapter.publish({
        publicationId: pubId,
        article: {
          title: mockArticle.title,
          content: 'Content',
          metadata: { articleId },
        },
        destinationConfig: { siteId },
      });

      expect(secondResult.externalResourceId).toBe(articleId);
      expect(secondResult.externalUrl).toBe('/sites/engineering/architecting-distributed-systems');
      // Already READY so no duplicate update call was needed
      expect(mockArticleRepo.update).not.toHaveBeenCalled();
    });

    it('throws PlatformError NOT_FOUND when article does not exist', async () => {
      await expect(
        adapter.publish({
          publicationId: pubId,
          article: {
            title: 'Missing Article',
            content: 'Content',
            metadata: { articleId: 'non-existent' },
          },
          destinationConfig: { siteId },
        }),
      ).rejects.toThrow(PlatformError);
    });

    it('throws PlatformError NOT_FOUND when target site does not exist', async () => {
      (mockSiteRepo.listByOrganization as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      (mockSiteRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        adapter.publish({
          publicationId: pubId,
          article: {
            title: mockArticle.title,
            content: 'Content',
            metadata: { articleId },
          },
          destinationConfig: { siteId: 'non-existent' },
        }),
      ).rejects.toThrow(PlatformError);
    });
  });

  describe('Update & Delete Behavior', () => {
    it('updates an article and ensures status remains READY', async () => {
      mockArticle.status = 'READY';

      const updateResult = await adapter.update({
        publicationId: pubId,
        externalResourceId: articleId,
        article: {
          title: 'Architecting Distributed Systems (Updated)',
          content: 'Updated content',
          description: 'Updated excerpt',
          metadata: { articleId },
        },
        destinationConfig: { siteId },
      });

      expect(updateResult.externalResourceId).toBe(articleId);
      expect(mockArticleRepo.update).toHaveBeenCalledWith(
        articleId,
        expect.objectContaining({
          status: 'READY',
          title: 'Architecting Distributed Systems (Updated)',
          excerpt: 'Updated excerpt',
        }),
      );
    });

    it('unpublishes article on delete by transitioning status to DRAFT', async () => {
      mockArticle.status = 'READY';

      await adapter.delete({
        publicationId: pubId,
        externalResourceId: articleId,
        destinationConfig: { siteId },
      });

      expect(mockArticleRepo.update).toHaveBeenCalledWith(articleId, { status: 'DRAFT' });
      expect(mockArticle.status).toBe('DRAFT');
    });

    it('returns empty engagement metrics', async () => {
      const metrics = await adapter.fetchMetrics({
        publicationId: pubId,
        externalResourceId: articleId,
      });

      expect(metrics.views).toBe(0);
      expect(metrics.reads).toBe(0);
      expect(typeof metrics.capturedAt).toBe('string');
    });
  });

  describe('Registry Integration', () => {
    it('is registered by default in platformAdapterRegistry', () => {
      expect(platformAdapterRegistry.has('ARTXFLOW_BLOG')).toBe(true);
      const regAdapter = platformAdapterRegistry.get('ARTXFLOW_BLOG');
      expect(regAdapter).toBeDefined();
      expect(regAdapter?.provider).toBe('ARTXFLOW_BLOG');
    });

    it('resolves via getPlatformAdapter helper', () => {
      const resolved = getPlatformAdapter('ARTXFLOW_BLOG');
      expect(resolved.provider).toBe('ARTXFLOW_BLOG');
    });
  });
});
