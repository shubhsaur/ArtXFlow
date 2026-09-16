import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleService, generateArticleSlug } from './article.service';
import {
  UnauthorizedOrganizationAccessError,
  ArticleNotFoundError,
  DuplicateSlugError,
  ValidationError,
} from '../errors';
import type {
  ArticleRepository,
  ArticleVersionRepository,
  OrganizationRepository,
  Article,
  ArticleVersion,
} from '@artxflow/database';

describe('ArticleService', () => {
  const context = {
    userId: 'user-author-123',
    organizationId: 'org-tenant-456',
  };

  const mockOrg = {
    id: context.organizationId,
    name: 'Engineering Org',
    slug: 'engineering-org',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockArticle: Article = {
    id: 'article-111',
    organizationId: context.organizationId,
    authorId: context.userId,
    title: 'Distributing Canonical Content',
    slug: 'distributing-canonical-content',
    excerpt: 'An overview of multi-destination publishing.',
    status: 'DRAFT',
    coverAssetId: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion1: ArticleVersion = {
    id: 'version-111',
    articleId: mockArticle.id,
    versionNumber: 1,
    content: '# Introduction\n\nOriginal version content.',
    contentFormat: 'markdown',
    metadata: {},
    createdBy: context.userId,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockVersion2: ArticleVersion = {
    id: 'version-222',
    articleId: mockArticle.id,
    versionNumber: 2,
    content: '# Introduction\n\nUpdated version content.',
    contentFormat: 'markdown',
    metadata: { tags: ['v2'] },
    createdBy: context.userId,
    createdAt: new Date('2026-01-02T00:00:00Z'),
  };

  let mockArticleRepo: ArticleRepository;
  let mockVersionRepo: ArticleVersionRepository;
  let mockOrgRepo: OrganizationRepository;
  let service: ArticleService;

  beforeEach(() => {
    vi.restoreAllMocks();

    mockOrgRepo = {
      getOrganizationForUser: vi.fn().mockResolvedValue({
        organization: mockOrg,
        role: 'OWNER',
      }),
    } as unknown as OrganizationRepository;

    mockArticleRepo = {
      findById: vi.fn().mockResolvedValue(mockArticle),
      findBySlug: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(mockArticle),
      createWithInitialVersion: vi.fn().mockResolvedValue({
        article: mockArticle,
        version: mockVersion1,
      }),
      update: vi
        .fn()
        .mockImplementation((_id, data) =>
          Promise.resolve({ ...mockArticle, ...data, updatedAt: new Date() }),
        ),
    } as unknown as ArticleRepository;

    mockVersionRepo = {
      getLatestVersion: vi.fn().mockResolvedValue(mockVersion1),
      listByArticle: vi.fn().mockResolvedValue([mockVersion2, mockVersion1]),
      create: vi.fn().mockResolvedValue(mockVersion2),
    } as unknown as ArticleVersionRepository;

    service = new ArticleService(mockArticleRepo, mockVersionRepo, mockOrgRepo);
  });

  describe('generateArticleSlug', () => {
    it('converts title to clean lowercase slug', () => {
      expect(generateArticleSlug('Building an Agentic Monorepo')).toBe(
        'building-an-agentic-monorepo',
      );
    });

    it('handles special characters and punctuation', () => {
      expect(generateArticleSlug("  Node.js v22 & Drizzle: A Developer's Guide!  ")).toBe(
        'node-js-v22-drizzle-a-developer-s-guide',
      );
    });

    it('falls back to "untitled-article" for empty or symbol-only title', () => {
      expect(generateArticleSlug('')).toBe('untitled-article');
      expect(generateArticleSlug('---')).toBe('untitled-article');
    });
  });

  describe('createArticle', () => {
    it('creates article and initial version 1 transactionally', async () => {
      const result = await service.createArticle(context, {
        title: 'Distributing Canonical Content',
        content: '# Introduction\n\nOriginal version content.',
      });

      expect(result.article).toEqual(mockArticle);
      expect(result.version).toEqual(mockVersion1);
      expect(mockArticleRepo.createWithInitialVersion).toHaveBeenCalledWith({
        article: {
          organizationId: context.organizationId,
          authorId: context.userId,
          title: 'Distributing Canonical Content',
          slug: 'distributing-canonical-content',
          excerpt: null,
          status: 'DRAFT',
          coverAssetId: null,
        },
        content: '# Introduction\n\nOriginal version content.',
        contentFormat: 'markdown',
        metadata: {},
        authorId: context.userId,
      });
    });

    it('rejects unauthorized user who is not a member of the organization', async () => {
      vi.mocked(mockOrgRepo.getOrganizationForUser).mockResolvedValue(null);

      await expect(
        service.createArticle(context, {
          title: 'New Post',
          content: 'Hello world',
        }),
      ).rejects.toThrow(UnauthorizedOrganizationAccessError);
    });

    it('validates required title and content', async () => {
      await expect(
        service.createArticle(context, {
          title: '   ',
          content: 'Hello',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        service.createArticle(context, {
          title: 'Valid Title',
          // @ts-expect-error testing missing content
          content: undefined,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects creation when slug already exists within organization', async () => {
      vi.mocked(mockArticleRepo.findBySlug).mockResolvedValue(mockArticle);

      await expect(
        service.createArticle(context, {
          title: 'Distributing Canonical Content',
          content: 'Some content',
        }),
      ).rejects.toThrow(DuplicateSlugError);
    });
  });

  describe('updateArticle', () => {
    it('updates metadata without incrementing version when content is unchanged', async () => {
      const result = await service.updateArticle(context, {
        articleId: mockArticle.id,
        title: 'Updated Title',
        status: 'READY',
      });

      expect(result.article.title).toBe('Updated Title');
      expect(result.article.status).toBe('READY');
      expect(result.versionIncremented).toBe(false);
      expect(result.version).toEqual(mockVersion1);
      expect(mockVersionRepo.create).not.toHaveBeenCalled();
    });

    it('increments version number and appends immutable version snapshot when content changes', async () => {
      const result = await service.updateArticle(context, {
        articleId: mockArticle.id,
        content: '# Introduction\n\nUpdated version content.',
        metadata: { tags: ['v2'] },
      });

      expect(result.versionIncremented).toBe(true);
      expect(result.version).toEqual(mockVersion2);
      expect(mockVersionRepo.create).toHaveBeenCalledWith({
        articleId: mockArticle.id,
        versionNumber: 2,
        content: '# Introduction\n\nUpdated version content.',
        contentFormat: 'markdown',
        metadata: { tags: ['v2'] },
        createdBy: context.userId,
      });
    });

    it('rejects update for non-existent article or cross-tenant article', async () => {
      vi.mocked(mockArticleRepo.findById).mockResolvedValue(null);

      await expect(
        service.updateArticle(context, {
          articleId: 'unknown-id',
          title: 'New Title',
        }),
      ).rejects.toThrow(ArticleNotFoundError);

      vi.mocked(mockArticleRepo.findById).mockResolvedValue({
        ...mockArticle,
        organizationId: 'other-org-999',
      });

      await expect(
        service.updateArticle(context, {
          articleId: mockArticle.id,
          title: 'New Title',
        }),
      ).rejects.toThrow(ArticleNotFoundError);
    });

    it('rejects slug collision when slug is updated to an existing slug in organization', async () => {
      const collidingArticle: Article = {
        ...mockArticle,
        id: 'article-222',
        slug: 'colliding-slug',
      };
      vi.mocked(mockArticleRepo.findBySlug).mockResolvedValue(collidingArticle);

      await expect(
        service.updateArticle(context, {
          articleId: mockArticle.id,
          slug: 'colliding-slug',
        }),
      ).rejects.toThrow(DuplicateSlugError);
    });
  });

  describe('getArticle', () => {
    it('retrieves article and latest version by default', async () => {
      const result = await service.getArticle(context, {
        articleId: mockArticle.id,
      });

      expect(result.article).toEqual(mockArticle);
      expect(result.version?.versionNumber).toBe(2);
      expect(result.versionsCount).toBe(2);
    });

    it('retrieves specific version when versionNumber is requested', async () => {
      const result = await service.getArticle(context, {
        articleId: mockArticle.id,
        versionNumber: 1,
      });

      expect(result.article).toEqual(mockArticle);
      expect(result.version?.versionNumber).toBe(1);
    });

    it('retrieves article by slug within organization', async () => {
      vi.mocked(mockArticleRepo.findBySlug).mockResolvedValue(mockArticle);

      const result = await service.getArticle(context, {
        slug: mockArticle.slug,
      });

      expect(result.article).toEqual(mockArticle);
      expect(mockArticleRepo.findBySlug).toHaveBeenCalledWith(
        context.organizationId,
        mockArticle.slug,
      );
    });

    it('rejects retrieval for cross-tenant article', async () => {
      vi.mocked(mockArticleRepo.findById).mockResolvedValue({
        ...mockArticle,
        organizationId: 'different-org',
      });

      await expect(
        service.getArticle(context, {
          articleId: mockArticle.id,
        }),
      ).rejects.toThrow(ArticleNotFoundError);
    });
  });
});
