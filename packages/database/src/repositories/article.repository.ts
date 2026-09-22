import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import { withTransaction } from '../transactions';
import type { DbExecutor } from './organization.repository';
import {
  articles,
  articleVersions,
  type Article,
  type NewArticle,
  type ArticleVersion,
} from '../schema/articles';
import { assets } from '../schema/assets';
import type { BaseRepository } from './index';

export interface ArticleWithCover extends Article {
  coverImageUrl: string | null;
}

export interface CreateArticleWithVersionInput {
  article: Omit<NewArticle, 'id' | 'createdAt' | 'updatedAt'>;
  content: string;
  contentFormat?: string;
  metadata?: Record<string, unknown>;
  authorId: string;
}

export class ArticleRepository implements BaseRepository<Article, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewArticle): Promise<Article> {
    const [result] = await this.db.insert(articles).values(data).returning();
    if (!result) {
      throw new Error('Failed to create article');
    }
    return result;
  }

  async findById(id: string): Promise<Article | null> {
    const [result] = await this.db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result || null;
  }

  async findArticleForOrganization(organizationId: string, id: string): Promise<Article | null> {
    const [result] = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.organizationId, organizationId), eq(articles.id, id)))
      .limit(1);
    return result || null;
  }

  async findBySlug(organizationId: string, slug: string): Promise<Article | null> {
    const [result] = await this.db
      .select()
      .from(articles)
      .where(and(eq(articles.organizationId, organizationId), eq(articles.slug, slug)))
      .limit(1);
    return result || null;
  }

  async listByOrganization(organizationId: string): Promise<Article[]> {
    return this.db
      .select()
      .from(articles)
      .where(eq(articles.organizationId, organizationId))
      .orderBy(desc(articles.createdAt));
  }

  async listWithCoverByOrganization(organizationId: string): Promise<ArticleWithCover[]> {
    const rows = await this.db
      .select({
        article: articles,
        coverUrl: assets.url,
      })
      .from(articles)
      .leftJoin(assets, eq(articles.coverAssetId, assets.id))
      .where(eq(articles.organizationId, organizationId))
      .orderBy(desc(articles.createdAt));

    return rows.map((row) => ({
      ...row.article,
      coverImageUrl: row.coverUrl ?? null,
    }));
  }

  async findWithCoverForOrganization(
    organizationId: string,
    id: string,
  ): Promise<ArticleWithCover | null> {
    const [row] = await this.db
      .select({
        article: articles,
        coverUrl: assets.url,
      })
      .from(articles)
      .leftJoin(assets, eq(articles.coverAssetId, assets.id))
      .where(and(eq(articles.organizationId, organizationId), eq(articles.id, id)))
      .limit(1);

    if (!row) return null;
    return { ...row.article, coverImageUrl: row.coverUrl ?? null };
  }

  async findWithCoverBySlug(
    organizationId: string,
    slug: string,
  ): Promise<ArticleWithCover | null> {
    const [row] = await this.db
      .select({
        article: articles,
        coverUrl: assets.url,
      })
      .from(articles)
      .leftJoin(assets, eq(articles.coverAssetId, assets.id))
      .where(and(eq(articles.organizationId, organizationId), eq(articles.slug, slug)))
      .limit(1);

    if (!row) return null;
    return { ...row.article, coverImageUrl: row.coverUrl ?? null };
  }

  /**
   * Resolves a published article by slug within an organization.
   * Returns null if the article does not exist, belongs to another organization,
   * or is in DRAFT/ARCHIVED status.
   */
  async findPublishedBySlug(organizationId: string, slug: string): Promise<Article | null> {
    const [result] = await this.db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.organizationId, organizationId),
          eq(articles.slug, slug),
          eq(articles.status, 'READY'),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all published articles for an organization, ordered by createdAt DESC.
   */
  async listPublishedByOrganization(organizationId: string): Promise<Article[]> {
    return this.db
      .select()
      .from(articles)
      .where(and(eq(articles.organizationId, organizationId), eq(articles.status, 'READY')))
      .orderBy(desc(articles.createdAt));
  }

  async update(
    id: string,
    data: Partial<Omit<NewArticle, 'id' | 'organizationId' | 'createdAt'>>,
  ): Promise<Article | null> {
    const [result] = await this.db
      .update(articles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(articles).where(eq(articles.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Transactionally creates an article along with its initial version (version 1).
   */
  async createWithInitialVersion(
    input: CreateArticleWithVersionInput,
  ): Promise<{ article: Article; version: ArticleVersion }> {
    return withTransaction(async (tx) => {
      const [article] = await tx
        .insert(articles)
        .values({
          ...input.article,
          authorId: input.authorId,
        })
        .returning();

      if (!article) {
        throw new Error('Failed to create article during atomic creation');
      }

      const [version] = await tx
        .insert(articleVersions)
        .values({
          articleId: article.id,
          versionNumber: 1,
          content: input.content,
          contentFormat: input.contentFormat || 'markdown',
          metadata: input.metadata || {},
          createdBy: input.authorId,
        })
        .returning();

      if (!version) {
        throw new Error('Failed to create initial article version');
      }

      return { article, version };
    });
  }
}

export const articleRepository = new ArticleRepository();
