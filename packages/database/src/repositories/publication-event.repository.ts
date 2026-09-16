import { eq, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  publicationEvents,
  type PublicationEvent,
  type NewPublicationEvent,
} from '../schema/publishing';
import type { BaseRepository } from './index';

/**
 * PublicationEventRepository manages the append-only event log for all publishing transitions.
 * By design, publication events are immutable: update and delete operations are intentionally omitted.
 */
export class PublicationEventRepository implements BaseRepository<PublicationEvent, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Appends a new event to the publication audit log.
   */
  async create(data: NewPublicationEvent): Promise<PublicationEvent> {
    const [result] = await this.db.insert(publicationEvents).values(data).returning();
    if (!result) {
      throw new Error('Failed to record publication event');
    }
    return result;
  }

  /**
   * Looks up a publication event by unique ID.
   */
  async findById(id: string): Promise<PublicationEvent | null> {
    const [result] = await this.db
      .select()
      .from(publicationEvents)
      .where(eq(publicationEvents.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Lists all historical events for a specific publication in chronological order.
   */
  async listByPublication(publicationId: string): Promise<PublicationEvent[]> {
    return this.db
      .select()
      .from(publicationEvents)
      .where(eq(publicationEvents.publicationId, publicationId))
      .orderBy(desc(publicationEvents.createdAt));
  }

  /**
   * Lists events belonging to a distributed workflow correlation ID.
   */
  async listByCorrelationId(correlationId: string): Promise<PublicationEvent[]> {
    return this.db
      .select()
      .from(publicationEvents)
      .where(eq(publicationEvents.correlationId, correlationId))
      .orderBy(desc(publicationEvents.createdAt));
  }
}

export const publicationEventRepository = new PublicationEventRepository();
