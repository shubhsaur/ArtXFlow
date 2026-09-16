import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  analyticsSnapshots,
  analyticsRawEvents,
  type AnalyticsSnapshot,
  type NewAnalyticsSnapshot,
  type AnalyticsRawEvent,
  type NewAnalyticsRawEvent,
} from '../schema/analytics';
import type { BaseRepository } from './index';

export interface AggregateMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  lastCapturedAt: Date | null;
}

export class AnalyticsRepository implements BaseRepository<AnalyticsSnapshot, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Persists a point-in-time metrics snapshot.
   * Ensures tenant organization isolation and explicit timestamps.
   */
  async createSnapshot(data: NewAnalyticsSnapshot): Promise<AnalyticsSnapshot> {
    const [result] = await this.db.insert(analyticsSnapshots).values(data).returning();
    if (!result) {
      throw new Error('Failed to create analytics snapshot');
    }
    return result;
  }

  /**
   * Base repository contract: find snapshot by ID.
   */
  async findById(id: string): Promise<AnalyticsSnapshot | null> {
    const [result] = await this.db
      .select()
      .from(analyticsSnapshots)
      .where(eq(analyticsSnapshots.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Finds snapshot by ID scoped strictly to an organization.
   */
  async findForOrganization(
    organizationId: string,
    snapshotId: string,
  ): Promise<AnalyticsSnapshot | null> {
    const [result] = await this.db
      .select()
      .from(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.organizationId, organizationId),
          eq(analyticsSnapshots.id, snapshotId),
        ),
      )
      .limit(1);
    return result || null;
  }

  /**
   * Retrieves the latest metrics snapshot for a specific publication,
   * scoped strictly to the organization.
   */
  async findLatestForPublication(
    organizationId: string,
    publicationId: string,
  ): Promise<AnalyticsSnapshot | null> {
    const [result] = await this.db
      .select()
      .from(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.organizationId, organizationId),
          eq(analyticsSnapshots.publicationId, publicationId),
        ),
      )
      .orderBy(desc(analyticsSnapshots.capturedAt))
      .limit(1);
    return result || null;
  }

  /**
   * Lists historical snapshots for a publication in chronological order descending.
   */
  async listSnapshotsForPublication(
    organizationId: string,
    publicationId: string,
    limit = 50,
  ): Promise<AnalyticsSnapshot[]> {
    return this.db
      .select()
      .from(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.organizationId, organizationId),
          eq(analyticsSnapshots.publicationId, publicationId),
        ),
      )
      .orderBy(desc(analyticsSnapshots.capturedAt))
      .limit(limit);
  }

  /**
   * Lists snapshots for a destination across publications.
   */
  async listSnapshotsForDestination(
    organizationId: string,
    destinationId: string,
    limit = 50,
  ): Promise<AnalyticsSnapshot[]> {
    return this.db
      .select()
      .from(analyticsSnapshots)
      .where(
        and(
          eq(analyticsSnapshots.organizationId, organizationId),
          eq(analyticsSnapshots.destinationId, destinationId),
        ),
      )
      .orderBy(desc(analyticsSnapshots.capturedAt))
      .limit(limit);
  }

  /**
   * Records an append-only raw analytics event or telemetry payload.
   */
  async recordRawEvent(data: NewAnalyticsRawEvent): Promise<AnalyticsRawEvent> {
    const [result] = await this.db.insert(analyticsRawEvents).values(data).returning();
    if (!result) {
      throw new Error('Failed to record analytics raw event');
    }
    return result;
  }

  /**
   * Lists raw events for an organization, optionally filtered by publication.
   */
  async listRawEvents(
    organizationId: string,
    publicationId?: string,
    limit = 100,
  ): Promise<AnalyticsRawEvent[]> {
    const conditions = [eq(analyticsRawEvents.organizationId, organizationId)];
    if (publicationId) {
      conditions.push(eq(analyticsRawEvents.publicationId, publicationId));
    }

    return this.db
      .select()
      .from(analyticsRawEvents)
      .where(and(...conditions))
      .orderBy(desc(analyticsRawEvents.occurredAt))
      .limit(limit);
  }
}

export const analyticsRepository = new AnalyticsRepository();
