import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  publications,
  type Publication,
  type NewPublication,
  type PublicationStatus,
} from '../schema/publishing';
import type { BaseRepository } from './index';

export interface PublicationStatusUpdate {
  status: PublicationStatus;
  externalResourceId?: string | null;
  externalUrl?: string | null;
  publishedAt?: Date | null;
  lastAttemptAt?: Date | null;
  attemptCount?: number;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  overrides?: Record<string, unknown>;
}

export class PublicationRepository implements BaseRepository<Publication, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new publication binding an immutable article version to a destination.
   */
  async create(data: NewPublication): Promise<Publication> {
    const [result] = await this.db.insert(publications).values(data).returning();
    if (!result) {
      throw new Error('Failed to create publication');
    }
    return result;
  }

  /**
   * Looks up a publication by unique ID across all tenants (internal system use).
   */
  async findById(id: string): Promise<Publication | null> {
    const [result] = await this.db
      .select()
      .from(publications)
      .where(eq(publications.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Resolves a publication within strict tenant organization boundaries.
   */
  async findForOrganization(
    organizationId: string,
    publicationId: string,
  ): Promise<Publication | null> {
    const [result] = await this.db
      .select()
      .from(publications)
      .where(
        and(eq(publications.organizationId, organizationId), eq(publications.id, publicationId)),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Looks up the unique publication for a specific article version and destination
   * within an organization.
   */
  async findByVersionAndDestination(
    organizationId: string,
    articleVersionId: string,
    destinationId: string,
  ): Promise<Publication | null> {
    const [result] = await this.db
      .select()
      .from(publications)
      .where(
        and(
          eq(publications.organizationId, organizationId),
          eq(publications.articleVersionId, articleVersionId),
          eq(publications.destinationId, destinationId),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all publications for a given article within an organization.
   */
  async listByArticle(organizationId: string, articleId: string): Promise<Publication[]> {
    return this.db
      .select()
      .from(publications)
      .where(
        and(eq(publications.organizationId, organizationId), eq(publications.articleId, articleId)),
      )
      .orderBy(desc(publications.createdAt));
  }

  /**
   * Lists all publications for an immutable article version within an organization.
   */
  async listByArticleVersion(
    organizationId: string,
    articleVersionId: string,
  ): Promise<Publication[]> {
    return this.db
      .select()
      .from(publications)
      .where(
        and(
          eq(publications.organizationId, organizationId),
          eq(publications.articleVersionId, articleVersionId),
        ),
      )
      .orderBy(desc(publications.createdAt));
  }

  /**
   * Lists all publications for a destination within an organization.
   */
  async listByDestination(organizationId: string, destinationId: string): Promise<Publication[]> {
    return this.db
      .select()
      .from(publications)
      .where(
        and(
          eq(publications.organizationId, organizationId),
          eq(publications.destinationId, destinationId),
        ),
      )
      .orderBy(desc(publications.createdAt));
  }

  /**
   * Lists all publications for an organization.
   */
  async listByOrganization(organizationId: string): Promise<Publication[]> {
    return this.db
      .select()
      .from(publications)
      .where(eq(publications.organizationId, organizationId))
      .orderBy(desc(publications.createdAt));
  }

  /**
   * Updates publication status, external resource references, and execution metrics.
   */
  async updateStatus(
    id: string,
    organizationId: string,
    data: PublicationStatusUpdate,
  ): Promise<Publication> {
    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.externalResourceId !== undefined) {
      updateData.externalResourceId = data.externalResourceId;
    }
    if (data.externalUrl !== undefined) {
      updateData.externalUrl = data.externalUrl;
    }
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt;
    }
    if (data.lastAttemptAt !== undefined) {
      updateData.lastAttemptAt = data.lastAttemptAt;
    }
    if (data.attemptCount !== undefined) {
      updateData.attemptCount = data.attemptCount;
    }
    if (data.lastErrorCode !== undefined) {
      updateData.lastErrorCode = data.lastErrorCode;
    }
    if (data.lastErrorMessage !== undefined) {
      updateData.lastErrorMessage = data.lastErrorMessage;
    }
    if (data.overrides !== undefined) {
      updateData.overrides = data.overrides;
    }

    const [updated] = await this.db
      .update(publications)
      .set(updateData)
      .where(and(eq(publications.id, id), eq(publications.organizationId, organizationId)))
      .returning();

    if (!updated) {
      throw new Error(`Publication with ID '${id}' not found in organization '${organizationId}'`);
    }

    return updated;
  }
}

export const publicationRepository = new PublicationRepository();
