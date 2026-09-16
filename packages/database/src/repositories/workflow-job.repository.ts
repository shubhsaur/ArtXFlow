import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../client';
import type { DbExecutor } from './organization.repository';
import { workflowJobs, type WorkflowJob, type NewWorkflowJob } from '../schema/publishing';
import type { BaseRepository } from './index';

export class WorkflowJobRepository implements BaseRepository<WorkflowJob, string> {
  private customDb?: DbExecutor;

  constructor(db?: DbExecutor) {
    this.customDb = db;
  }

  private get db(): DbExecutor {
    return this.customDb || getDb();
  }

  /**
   * Registers a new workflow job execution with idempotency protection.
   */
  async create(data: NewWorkflowJob): Promise<WorkflowJob> {
    const [result] = await this.db.insert(workflowJobs).values(data).returning();
    if (!result) {
      throw new Error('Failed to create workflow job');
    }
    return result;
  }

  /**
   * Looks up a workflow job by internal primary key.
   */
  async findById(id: string): Promise<WorkflowJob | null> {
    const [result] = await this.db
      .select()
      .from(workflowJobs)
      .where(eq(workflowJobs.id, id))
      .limit(1);
    return result || null;
  }

  /**
   * Looks up a workflow job by unique idempotency key to prevent duplicate job creation.
   */
  async findByIdempotencyKey(idempotencyKey: string): Promise<WorkflowJob | null> {
    const [result] = await this.db
      .select()
      .from(workflowJobs)
      .where(eq(workflowJobs.idempotencyKey, idempotencyKey))
      .limit(1);
    return result || null;
  }

  /**
   * Resolves a workflow job within strict tenant organization boundaries.
   */
  async findForOrganization(organizationId: string, jobId: string): Promise<WorkflowJob | null> {
    const [result] = await this.db
      .select()
      .from(workflowJobs)
      .where(and(eq(workflowJobs.organizationId, organizationId), eq(workflowJobs.id, jobId)))
      .limit(1);
    return result || null;
  }

  /**
   * Lists workflow jobs associated with a specific domain reference within an organization.
   */
  async listByReference(
    organizationId: string,
    referenceType: string,
    referenceId: string,
  ): Promise<WorkflowJob[]> {
    return this.db
      .select()
      .from(workflowJobs)
      .where(
        and(
          eq(workflowJobs.organizationId, organizationId),
          eq(workflowJobs.referenceType, referenceType),
          eq(workflowJobs.referenceId, referenceId),
        ),
      )
      .orderBy(desc(workflowJobs.createdAt));
  }

  /**
   * Updates workflow execution status and external execution identifier.
   */
  async updateStatus(
    id: string,
    organizationId: string,
    status: string,
    workflowId?: string,
  ): Promise<WorkflowJob> {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (workflowId !== undefined) {
      updateData.workflowId = workflowId;
    }

    const [updated] = await this.db
      .update(workflowJobs)
      .set(updateData)
      .where(and(eq(workflowJobs.id, id), eq(workflowJobs.organizationId, organizationId)))
      .returning();

    if (!updated) {
      throw new Error(`Workflow job with ID '${id}' not found in organization '${organizationId}'`);
    }

    return updated;
  }
}

export const workflowJobRepository = new WorkflowJobRepository();
