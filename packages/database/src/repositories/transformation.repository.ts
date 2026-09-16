import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  transformations,
  type Transformation,
  type NewTransformation,
  type TransformationStatus,
} from '../schema/transformations';
import type { BaseRepository } from './index';

export class TransformationRepository implements BaseRepository<Transformation, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new transformation record.
   */
  async create(data: NewTransformation): Promise<Transformation> {
    const [result] = await this.db.insert(transformations).values(data).returning();
    if (!result) {
      throw new Error('Failed to create transformation record');
    }
    return result;
  }

  /**
   * Base repository lookup by ID.
   */
  async findById(id: string): Promise<Transformation | null> {
    const [result] = await this.db
      .select()
      .from(transformations)
      .where(eq(transformations.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Looks up a transformation scoped strictly to an organization.
   */
  async findForOrganization(
    organizationId: string,
    transformationId: string,
  ): Promise<Transformation | null> {
    const [result] = await this.db
      .select()
      .from(transformations)
      .where(
        and(
          eq(transformations.organizationId, organizationId),
          eq(transformations.id, transformationId),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all transformations for a given article version within an organization.
   */
  async listForArticleVersion(
    organizationId: string,
    articleVersionId: string,
  ): Promise<Transformation[]> {
    return this.db
      .select()
      .from(transformations)
      .where(
        and(
          eq(transformations.organizationId, organizationId),
          eq(transformations.articleVersionId, articleVersionId),
        ),
      )
      .orderBy(desc(transformations.createdAt));
  }

  /**
   * Updates the review status of a transformation artifact (e.g. APPROVED, REJECTED).
   */
  async updateStatus(
    organizationId: string,
    transformationId: string,
    status: TransformationStatus,
    approvedByUserId?: string,
  ): Promise<Transformation> {
    const [result] = await this.db
      .update(transformations)
      .set({
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        approvedByUserId: status === 'APPROVED' ? approvedByUserId : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transformations.organizationId, organizationId),
          eq(transformations.id, transformationId),
        ),
      )
      .returning();

    if (!result) {
      throw new Error(
        `Transformation '${transformationId}' not found in organization '${organizationId}'`,
      );
    }

    return result;
  }
}

export const transformationRepository = new TransformationRepository();
