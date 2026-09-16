import { describe, it, expect, vi } from 'vitest';
import { PublicSiteService } from './public-site.service';
import type {
  SiteRepository,
  ArticleRepository,
  ArticleVersionRepository,
} from '@artxflow/database';

describe('PublicSiteService', () => {
  const org1Id = 'org-uuid-1';
  const org2Id = 'org-uuid-2';

  const mockActiveSite = {
    id: 'site-uuid-1',
    organizationId: org1Id,
    name: 'ArtXFlow Engineering',
    subdomain: 'engineering',
    customDomain: 'blog.artxflow.com',
    status: 'ACTIVE' as const,
    themeConfig: { primaryColor: '#0B87FE' },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockMaintenanceSite = {
    ...mockActiveSite,
    id: 'site-uuid-maintenance',
    subdomain: 'maintenance-blog',
    status: 'MAINTENANCE' as const,
  };

  const mockPublishedArticle = {
    id: 'article-uuid-1',
    organizationId: org1Id,
    authorId: 'user-1',
    title: 'Modern Content Distribution',
    slug: 'modern-content-distribution',
    excerpt: 'An overview of canonical article distribution.',
    status: 'READY' as const,
    coverAssetId: null,
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  const mockDraftArticle = {
    ...mockPublishedArticle,
    id: 'article-uuid-draft',
    slug: 'secret-draft',
    status: 'DRAFT' as const,
  };

  const mockVersion = {
    id: 'version-uuid-1',
    articleId: mockPublishedArticle.id,
    versionNumber: 1,
    content: '# Modern Content Distribution\n\nCanonical markdown body.',
    contentFormat: 'markdown',
    metadata: { tags: ['devops', 'distribution'] },
    createdBy: 'user-1',
    createdAt: new Date('2026-01-02T00:00:00Z'),
  };

  describe('resolvePublicSite', () => {
    it('resolves active site by subdomain', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite),
      } as unknown as SiteRepository;

      const service = new PublicSiteService(siteRepo);
      const site = await service.resolvePublicSite('ENGINEERING ');

      expect(site).toEqual(mockActiveSite);
      expect(siteRepo.findBySubdomain).toHaveBeenCalledWith('engineering');
    });

    it('returns null when site is in MAINTENANCE or ARCHIVED status', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockMaintenanceSite),
      } as unknown as SiteRepository;

      const service = new PublicSiteService(siteRepo);
      const site = await service.resolvePublicSite('maintenance-blog');

      expect(site).toBeNull();
    });

    it('returns null when site is not found or subdomain is empty', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(null),
      } as unknown as SiteRepository;

      const service = new PublicSiteService(siteRepo);
      expect(await service.resolvePublicSite('unknown')).toBeNull();
      expect(await service.resolvePublicSite('')).toBeNull();
      expect(await service.resolvePublicSite('   ')).toBeNull();
    });
  });

  describe('getPublicArticle (Draft Isolation & Canonical Resolution)', () => {
    it('successfully resolves published article and latest version', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite),
      } as unknown as SiteRepository;

      const articleRepo = {
        findPublishedBySlug: vi.fn().mockResolvedValue(mockPublishedArticle),
      } as unknown as ArticleRepository;

      const versionRepo = {
        getLatestVersion: vi.fn().mockResolvedValue(mockVersion),
      } as unknown as ArticleVersionRepository;

      const service = new PublicSiteService(siteRepo, articleRepo, versionRepo);
      const result = await service.getPublicArticle('engineering', 'modern-content-distribution');

      expect(result).not.toBeNull();
      expect(result?.site).toEqual(mockActiveSite);
      expect(result?.article).toEqual(mockPublishedArticle);
      expect(result?.version).toEqual(mockVersion);
      expect(articleRepo.findPublishedBySlug).toHaveBeenCalledWith(
        mockActiveSite.organizationId,
        'modern-content-distribution',
      );
    });

    it('strictly isolates drafts: returns null when article is in DRAFT status', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite),
      } as unknown as SiteRepository;

      // findPublishedBySlug returns null for DRAFT status
      const articleRepo = {
        findPublishedBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as ArticleRepository;

      const versionRepo = {
        getLatestVersion: vi.fn(),
      } as unknown as ArticleVersionRepository;

      const service = new PublicSiteService(siteRepo, articleRepo, versionRepo);
      const result = await service.getPublicArticle('engineering', mockDraftArticle.slug);

      expect(result).toBeNull();
      expect(versionRepo.getLatestVersion).not.toHaveBeenCalled();
      expect(articleRepo.findPublishedBySlug).toHaveBeenCalledWith(
        mockActiveSite.organizationId,
        mockDraftArticle.slug,
      );
    });

    it('returns null when article slug does not exist', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite),
      } as unknown as SiteRepository;

      const articleRepo = {
        findPublishedBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as ArticleRepository;

      const versionRepo = {
        getLatestVersion: vi.fn(),
      } as unknown as ArticleVersionRepository;

      const service = new PublicSiteService(siteRepo, articleRepo, versionRepo);
      const result = await service.getPublicArticle('engineering', 'non-existent-slug');

      expect(result).toBeNull();
    });

    it('returns null when site is inactive or not found', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(null),
      } as unknown as SiteRepository;

      const articleRepo = {
        findPublishedBySlug: vi.fn(),
      } as unknown as ArticleRepository;

      const service = new PublicSiteService(siteRepo, articleRepo);
      const result = await service.getPublicArticle('unknown-site', 'some-slug');

      expect(result).toBeNull();
      expect(articleRepo.findPublishedBySlug).not.toHaveBeenCalled();
    });

    it('blocks cross-tenant article resolution: returns null when article belongs to another org', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite), // belongs to org1Id
      } as unknown as SiteRepository;

      // When queried with org1Id, foreign article belonging to org2Id is not returned
      const articleRepo = {
        findPublishedBySlug: vi.fn().mockImplementation((orgId) => {
          if (orgId === org2Id) return Promise.resolve(mockPublishedArticle);
          return Promise.resolve(null);
        }),
      } as unknown as ArticleRepository;

      const service = new PublicSiteService(siteRepo, articleRepo);
      const result = await service.getPublicArticle('engineering', 'foreign-article');

      expect(result).toBeNull();
    });
  });

  describe('listPublicArticles', () => {
    it('lists published articles for active site', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(mockActiveSite),
      } as unknown as SiteRepository;

      const articleRepo = {
        listPublishedByOrganization: vi.fn().mockResolvedValue([mockPublishedArticle]),
      } as unknown as ArticleRepository;

      const service = new PublicSiteService(siteRepo, articleRepo);
      const result = await service.listPublicArticles('engineering');

      expect(result).not.toBeNull();
      expect(result?.site).toEqual(mockActiveSite);
      expect(result?.articles).toHaveLength(1);
      expect(result?.articles[0]?.status).toBe('READY');
    });

    it('returns null when site is not found', async () => {
      const siteRepo = {
        findBySubdomain: vi.fn().mockResolvedValue(null),
      } as unknown as SiteRepository;

      const articleRepo = {
        listPublishedByOrganization: vi.fn(),
      } as unknown as ArticleRepository;

      const service = new PublicSiteService(siteRepo, articleRepo);
      const result = await service.listPublicArticles('unknown');

      expect(result).toBeNull();
      expect(articleRepo.listPublishedByOrganization).not.toHaveBeenCalled();
    });
  });
});
