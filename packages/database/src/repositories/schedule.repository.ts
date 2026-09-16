import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import {
  schedules,
  type Schedule,
  type NewSchedule,
  type ScheduleStatus,
} from '../schema/publishing';
import type { BaseRepository } from './index';

export interface ScheduleStatusUpdate {
  status: ScheduleStatus;
  workflowId?: string | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  executedAt?: Date | null;
}

export class ScheduleRepository implements BaseRepository<Schedule, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Creates a new scheduled publishing record.
   */
  async create(data: NewSchedule): Promise<Schedule> {
    const [result] = await this.db.insert(schedules).values(data).returning();
    if (!result) {
      throw new Error('Failed to create schedule');
    }
    return result;
  }

  /**
   * Finds a schedule by ID without tenant scoping (system use).
   */
  async findById(id: string): Promise<Schedule | null> {
    const [result] = await this.db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
    return result || null;
  }

  /**
   * Finds a schedule by ID strictly scoped to an organization.
   */
  async findForOrganization(organizationId: string, id: string): Promise<Schedule | null> {
    const [result] = await this.db
      .select()
      .from(schedules)
      .where(and(eq(schedules.organizationId, organizationId), eq(schedules.id, id)))
      .limit(1);
    return result || null;
  }

  /**
   * Lists all schedules for a specific article within an organization.
   */
  async listByArticle(organizationId: string, articleId: string): Promise<Schedule[]> {
    return this.db
      .select()
      .from(schedules)
      .where(and(eq(schedules.organizationId, organizationId), eq(schedules.articleId, articleId)))
      .orderBy(desc(schedules.scheduledAt));
  }

  /**
   * Lists all schedules for an organization, optionally filtered by status.
   */
  async listByOrganization(
    organizationId: string,
    options?: { status?: ScheduleStatus },
  ): Promise<Schedule[]> {
    const conditions = [eq(schedules.organizationId, organizationId)];
    if (options?.status) {
      conditions.push(eq(schedules.status, options.status));
    }

    return this.db
      .select()
      .from(schedules)
      .where(and(...conditions))
      .orderBy(desc(schedules.scheduledAt));
  }

  /**
   * Updates schedule status, execution metadata, and error details.
   */
  async updateStatus(
    id: string,
    organizationId: string,
    data: ScheduleStatusUpdate,
  ): Promise<Schedule> {
    const updateData: Record<string, unknown> = {
      status: data.status,
      updatedAt: new Date(),
    };

    if (data.workflowId !== undefined) {
      updateData.workflowId = data.workflowId;
    }
    if (data.errorMessage !== undefined) {
      updateData.errorMessage = data.errorMessage;
    }
    if (data.errorCode !== undefined) {
      updateData.errorCode = data.errorCode;
    }
    if (data.executedAt !== undefined) {
      updateData.executedAt = data.executedAt;
    }

    const [updated] = await this.db
      .update(schedules)
      .set(updateData)
      .where(and(eq(schedules.id, id), eq(schedules.organizationId, organizationId)))
      .returning();

    if (!updated) {
      throw new Error(`Schedule with ID '${id}' not found in organization '${organizationId}'`);
    }

    return updated;
  }

  /**
   * Cancels a pending schedule. Only schedules in 'SCHEDULED' state can be canceled.
   */
  async cancel(id: string, organizationId: string): Promise<Schedule> {
    const existing = await this.findForOrganization(organizationId, id);
    if (!existing) {
      throw new Error(`Schedule with ID '${id}' not found in organization '${organizationId}'`);
    }

    if (existing.status !== 'SCHEDULED') {
      throw new Error(
        `Cannot cancel schedule with ID '${id}' because it is in '${existing.status}' status (must be 'SCHEDULED')`,
      );
    }

    const [canceled] = await this.db
      .update(schedules)
      .set({
        status: 'CANCELED',
        updatedAt: new Date(),
      })
      .where(and(eq(schedules.id, id), eq(schedules.organizationId, organizationId)))
      .returning();

    return canceled;
  }
}

export const scheduleRepository = new ScheduleRepository();
