import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import { articleVersions, type ArticleVersion, type NewArticleVersion } from '../schema/articles';
import type { BaseRepository } from './index';

/**
 * ArticleVersionRepository manages immutable article snapshots.
 *
 * NOTE: By domain architecture rules, versions are strictly immutable.
 * No update or mutation methods are exposed on this repository.
 */
export class ArticleVersionRepository implements BaseRepository<ArticleVersion, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  async create(data: NewArticleVersion): Promise<ArticleVersion> {
    const [result] = await this.db.insert(articleVersions).values(data).returning();
    if (!result) {
      throw new Error('Failed to create article version');
    }
    return result;
  }

  async findById(id: string): Promise<ArticleVersion | null> {
    const [result] = await this.db
      .select()
      .from(articleVersions)
      .where(eq(articleVersions.id, id))
      .limit(1);
    return result || null;
  }

  async findForArticle(articleId: string, versionId: string): Promise<ArticleVersion | null> {
    const [result] = await this.db
      .select()
      .from(articleVersions)
      .where(and(eq(articleVersions.articleId, articleId), eq(articleVersions.id, versionId)))
      .limit(1);
    return result || null;
  }

  async findByArticleAndVersion(
    articleId: string,
    versionNumber: number,
  ): Promise<ArticleVersion | null> {
    const [result] = await this.db
      .select()
      .from(articleVersions)
      .where(
        and(
          eq(articleVersions.articleId, articleId),
          eq(articleVersions.versionNumber, versionNumber),
        ),
      )
      .limit(1);
    return result || null;
  }

  async getLatestVersion(articleId: string): Promise<ArticleVersion | null> {
    const [result] = await this.db
      .select()
      .from(articleVersions)
      .where(eq(articleVersions.articleId, articleId))
      .orderBy(desc(articleVersions.versionNumber))
      .limit(1);
    return result || null;
  }

  async listByArticle(articleId: string): Promise<ArticleVersion[]> {
    return this.db
      .select()
      .from(articleVersions)
      .where(eq(articleVersions.articleId, articleId))
      .orderBy(desc(articleVersions.versionNumber));
  }
}

export const articleVersionRepository = new ArticleVersionRepository();
