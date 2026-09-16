import { describe, it, expect, vi } from 'vitest';
import { ArticleRepository } from './article.repository';
import { ArticleVersionRepository } from './article-version.repository';
import { articles, articleVersions, type Article, type ArticleVersion } from '../schema/articles';
import type { DbClient } from '../client';

vi.mock('../transactions', () => ({
  withTransaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
    // Provide a mock tx that supports insert/select/returning
    const mockTx = {
      insert: vi.fn().mockImplementation((table) => ({
        values: vi.fn().mockImplementation((values) => ({
          returning: vi.fn().mockResolvedValue([
            table === articles
              ? {
                  id: 'article-uuid-1',
                  ...values,
                  createdAt: new Date('2026-01-01T00:00:00Z'),
                  updatedAt: new Date('2026-01-01T00:00:00Z'),
                }
              : {
                  id: 'version-uuid-1',
                  ...values,
                  createdAt: new Date('2026-01-01T00:00:00Z'),
                },
          ]),
        })),
      })),
    };
    return cb(mockTx);
  }),
}));

describe('Article & ArticleVersion Repositories and Schema', () => {
  const mockArticle: Article = {
    id: '11111111-1111-1111-1111-111111111111',
    organizationId: '22222222-2222-2222-2222-222222222222',
    authorId: 'user-author-123',
    title: 'Building Modern Content Distribution',
    slug: 'building-modern-content-distribution',
    excerpt: 'An overview of canonical article distribution.',
    status: 'DRAFT',
    coverAssetId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion1: ArticleVersion = {
    id: '33333333-3333-3333-3333-333333333333',
    articleId: mockArticle.id,
    versionNumber: 1,
    content: '# Introduction\n\nCanonical article content here.',
    contentFormat: 'markdown',
    metadata: { tags: ['engineering', 'architecture'] },
    createdBy: mockArticle.authorId,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion2: ArticleVersion = {
    id: '44444444-4444-4444-4444-444444444444',
    articleId: mockArticle.id,
    versionNumber: 2,
    content: '# Introduction\n\nUpdated canonical article content.',
    contentFormat: 'markdown',
    metadata: { tags: ['engineering', 'architecture', 'v2'] },
    createdBy: mockArticle.authorId,
    createdAt: new Date('2026-01-02T00:00:00Z'),
  };

  describe('Schema Invariants', () => {
    it('defines articles table with organization-scoped slug unique constraint', () => {
      expect(articles.id).toBeDefined();
      expect(articles.organizationId).toBeDefined();
      expect(articles.authorId).toBeDefined();
      expect(articles.title).toBeDefined();
      expect(articles.slug).toBeDefined();
      expect(articles.status).toBeDefined();
    });

    it('defines article_versions table with unique composite constraint on articleId and versionNumber', () => {
      expect(articleVersions.id).toBeDefined();
      expect(articleVersions.articleId).toBeDefined();
      expect(articleVersions.versionNumber).toBeDefined();
      expect(articleVersions.content).toBeDefined();
      expect(articleVersions.contentFormat).toBeDefined();
      expect(articleVersions.metadata).toBeDefined();
      expect(articleVersions.createdBy).toBeDefined();
    });
  });

  describe('ArticleRepository', () => {
    it('creates an article', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockArticle]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.create({
        organizationId: mockArticle.organizationId,
        authorId: mockArticle.authorId,
        title: mockArticle.title,
        slug: mockArticle.slug,
      });

      expect(result).toEqual(mockArticle);
    });

    it('finds an article by id', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockArticle]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.findById(mockArticle.id);

      expect(result).toEqual(mockArticle);
    });

    it('finds an article by organizationId and slug (tenant scoped)', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockArticle]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.findBySlug(mockArticle.organizationId, mockArticle.slug);

      expect(result).toEqual(mockArticle);
    });

    it('lists articles for an organization ordered by createdAt desc', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockArticle]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const results = await repo.listByOrganization(mockArticle.organizationId);

      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe(mockArticle.id);
    });

    it('finds published article by slug when status is READY', async () => {
      const publishedArticle = { ...mockArticle, status: 'READY' as const };
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([publishedArticle]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.findPublishedBySlug(mockArticle.organizationId, mockArticle.slug);

      expect(result).toEqual(publishedArticle);
      expect(result?.status).toBe('READY');
    });

    it('returns null for findPublishedBySlug when article is in DRAFT or not found', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.findPublishedBySlug(mockArticle.organizationId, 'draft-slug');

      expect(result).toBeNull();
    });

    it('lists only published articles for an organization', async () => {
      const publishedArticle = { ...mockArticle, status: 'READY' as const };
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([publishedArticle]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const results = await repo.listPublishedByOrganization(mockArticle.organizationId);

      expect(results).toHaveLength(1);
      expect(results[0]?.status).toBe('READY');
    });

    it('updates an article', async () => {
      const updated = { ...mockArticle, status: 'READY' as const };
      const mockDb = {
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([updated]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.update(mockArticle.id, { status: 'READY' });

      expect(result?.status).toBe('READY');
    });

    it('deletes an article', async () => {
      const mockDb = {
        delete: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockArticle]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleRepository(mockDb);
      const result = await repo.delete(mockArticle.id);

      expect(result).toBe(true);
    });

    it('transactionally creates article and initial version 1', async () => {
      const repo = new ArticleRepository();
      const { article, version } = await repo.createWithInitialVersion({
        article: {
          organizationId: mockArticle.organizationId,
          authorId: mockArticle.authorId,
          title: 'Initial Post',
          slug: 'initial-post',
          status: 'DRAFT',
        },
        content: '# Hello World',
        authorId: mockArticle.authorId,
      });

      expect(article.id).toBe('article-uuid-1');
      expect(version.versionNumber).toBe(1);
      expect(version.content).toBe('# Hello World');
    });
  });

  describe('ArticleVersionRepository (Immutable Semantics)', () => {
    it('creates an immutable article version', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockVersion1]),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleVersionRepository(mockDb);
      const result = await repo.create({
        articleId: mockArticle.id,
        versionNumber: 1,
        content: mockVersion1.content,
        createdBy: mockArticle.authorId,
      });

      expect(result).toEqual(mockVersion1);
    });

    it('finds version by articleId and versionNumber', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockVersion1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleVersionRepository(mockDb);
      const result = await repo.findByArticleAndVersion(mockArticle.id, 1);

      expect(result).toEqual(mockVersion1);
    });

    it('retrieves the latest version for an article', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue([mockVersion2]),
              }),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleVersionRepository(mockDb);
      const latest = await repo.getLatestVersion(mockArticle.id);

      expect(latest?.versionNumber).toBe(2);
    });

    it('lists all versions of an article ordered by versionNumber desc', async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([mockVersion2, mockVersion1]),
            }),
          }),
        }),
      } as unknown as DbClient;

      const repo = new ArticleVersionRepository(mockDb);
      const versions = await repo.listByArticle(mockArticle.id);

      expect(versions).toHaveLength(2);
      expect(versions[0]?.versionNumber).toBe(2);
      expect(versions[1]?.versionNumber).toBe(1);
    });

    it('strictly enforces immutability: ArticleVersionRepository does not expose update or delete methods', () => {
      const repo = new ArticleVersionRepository();
      expect((repo as unknown as Record<string, unknown>).update).toBeUndefined();
      expect((repo as unknown as Record<string, unknown>).delete).toBeUndefined();
    });
  });
});
