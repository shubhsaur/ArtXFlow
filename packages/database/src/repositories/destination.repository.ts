import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import { destinations, type Destination, type NewDestination } from '../schema/publishing';
import type { BaseRepository } from './index';

export class DestinationRepository implements BaseRepository<Destination, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new destination record.
   */
  async create(data: NewDestination): Promise<Destination> {
    const [result] = await this.db.insert(destinations).values(data).returning();
    if (!result) {
      throw new Error('Failed to create destination');
    }
    return result;
  }

  /**
   * Looks up a destination by unique ID across all tenants (internal system use).
   */
  async findById(id: string): Promise<Destination | null> {
    const [result] = await this.db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Resolves a destination within strict tenant organization boundaries.
   * Returns null if the destination belongs to another organization or does not exist.
   */
  async findForOrganization(
    organizationId: string,
    destinationId: string,
  ): Promise<Destination | null> {
    const [result] = await this.db
      .select()
      .from(destinations)
      .where(
        and(eq(destinations.organizationId, organizationId), eq(destinations.id, destinationId)),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Lists all destinations belonging to an organization.
   */
  async listByOrganization(organizationId: string): Promise<Destination[]> {
    return this.db
      .select()
      .from(destinations)
      .where(eq(destinations.organizationId, organizationId))
      .orderBy(desc(destinations.createdAt));
  }

  /**
   * Updates destination attributes within strict tenant boundaries.
   */
  async update(
    id: string,
    organizationId: string,
    data: Partial<Omit<NewDestination, 'id' | 'organizationId' | 'createdAt'>>,
  ): Promise<Destination> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    const [updated] = await this.db
      .update(destinations)
      .set(updateData)
      .where(and(eq(destinations.id, id), eq(destinations.organizationId, organizationId)))
      .returning();

    if (!updated) {
      throw new Error(`Destination with ID '${id}' not found in organization '${organizationId}'`);
    }

    return updated;
  }

  /**
   * Deletes a destination within strict tenant boundaries.
   */
  async delete(id: string, organizationId: string): Promise<boolean> {
    const result = await this.db
      .delete(destinations)
      .where(and(eq(destinations.id, id), eq(destinations.organizationId, organizationId)))
      .returning({ id: destinations.id });

    return result.length > 0;
  }
}

export const destinationRepository = new DestinationRepository();
