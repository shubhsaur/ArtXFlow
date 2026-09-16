import { workflowJobRepository, type WorkflowJobRepository } from '@artxflow/database';
import {
  isSideEffectingJobType,
  type JobQueue,
  type JobDispatcher,
  type EnqueueJobInput,
  type EnqueueJobResult,
  type ScheduleJobInput,
  type ScheduleJobResult,
  type CancelJobInput,
} from './job-queue';
import { MissingIdempotencyKeyError, JobCancellationError } from '../errors';

/**
 * Production-ready, database-backed implementation of JobQueue.
 * Coordinates between ArtXFlow's durable workflow_jobs records and an optional
 * transport dispatcher (such as Inngest in worker infrastructure).
 */
export class WorkflowJobQueue implements JobQueue {
  constructor(
    private readonly workflowJobRepo: WorkflowJobRepository = workflowJobRepository,
    private readonly dispatcher?: JobDispatcher,
  ) {}

  /**
   * Enqueues an immediate background job.
   * Enforces idempotency key rules and records execution in workflow_jobs.
   */
  async enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult> {
    const key = this.resolveIdempotencyKey(
      input.type,
      input.organizationId,
      input.referenceId,
      input.idempotencyKey,
    );

    // Check if job with this idempotency key already exists
    const existing = await this.workflowJobRepo.findByIdempotencyKey(key);
    if (existing) {
      return {
        jobId: existing.id,
        idempotencyKey: key,
        status: 'ALREADY_EXISTS',
        workflowJobId: existing.workflowId || existing.id,
        enqueuedAt: existing.createdAt.toISOString(),
      };
    }

    // Persist durable workflow job record in PENDING / QUEUED state
    const created = await this.workflowJobRepo.create({
      organizationId: input.organizationId,
      type: input.type,
      status: 'QUEUED',
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      idempotencyKey: key,
    });

    let externalWorkflowId: string | undefined;

    // Dispatch to background transport if available
    if (this.dispatcher) {
      externalWorkflowId = await this.dispatcher.dispatch({
        id: created.id,
        type: input.type,
        idempotencyKey: key,
        organizationId: input.organizationId,
        payload: input.payload || {},
        correlationId: input.correlationId,
      });

      if (externalWorkflowId) {
        await this.workflowJobRepo.updateStatus(
          created.id,
          input.organizationId,
          'QUEUED',
          externalWorkflowId,
        );
      }
    }

    return {
      jobId: created.id,
      idempotencyKey: key,
      status: 'QUEUED',
      workflowJobId: externalWorkflowId || created.id,
      enqueuedAt: created.createdAt.toISOString(),
    };
  }

  /**
   * Schedules a job for future execution.
   */
  async schedule(input: ScheduleJobInput): Promise<ScheduleJobResult> {
    const key = this.resolveIdempotencyKey(
      input.type,
      input.organizationId,
      input.referenceId,
      input.idempotencyKey,
    );

    const scheduledDate =
      typeof input.scheduledAt === 'string' ? new Date(input.scheduledAt) : input.scheduledAt;

    const existing = await this.workflowJobRepo.findByIdempotencyKey(key);
    if (existing) {
      return {
        jobId: existing.id,
        idempotencyKey: key,
        status: 'ALREADY_EXISTS',
        scheduledAt: scheduledDate.toISOString(),
        workflowJobId: existing.workflowId || existing.id,
      };
    }

    const created = await this.workflowJobRepo.create({
      organizationId: input.organizationId,
      type: input.type,
      status: 'SCHEDULED',
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      idempotencyKey: key,
    });

    let externalWorkflowId: string | undefined;

    if (this.dispatcher) {
      externalWorkflowId = await this.dispatcher.schedule({
        id: created.id,
        type: input.type,
        idempotencyKey: key,
        organizationId: input.organizationId,
        payload: input.payload || {},
        scheduledAt: scheduledDate,
        correlationId: input.correlationId,
      });

      if (externalWorkflowId) {
        await this.workflowJobRepo.updateStatus(
          created.id,
          input.organizationId,
          'SCHEDULED',
          externalWorkflowId,
        );
      }
    }

    return {
      jobId: created.id,
      idempotencyKey: key,
      status: 'SCHEDULED',
      scheduledAt: scheduledDate.toISOString(),
      workflowJobId: externalWorkflowId || created.id,
    };
  }

  /**
   * Cancels a queued or scheduled job within tenant boundaries.
   */
  async cancel(input: CancelJobInput): Promise<void> {
    let job = null;

    if (input.jobId) {
      job = await this.workflowJobRepo.findForOrganization(input.organizationId, input.jobId);
    } else if (input.idempotencyKey) {
      const found = await this.workflowJobRepo.findByIdempotencyKey(input.idempotencyKey);
      if (found && found.organizationId === input.organizationId) {
        job = found;
      }
    } else {
      throw new JobCancellationError(
        'Either jobId or idempotencyKey must be provided for cancellation',
      );
    }

    if (!job) {
      throw new JobCancellationError(`Job not found in organization '${input.organizationId}'`);
    }

    if (job.status === 'COMPLETED' || job.status === 'RUNNING') {
      throw new JobCancellationError(
        `Cannot cancel job '${job.id}' in non-cancelable status '${job.status}'`,
      );
    }

    await this.workflowJobRepo.updateStatus(job.id, input.organizationId, 'CANCELED');

    if (this.dispatcher) {
      await this.dispatcher.cancel(job.id, job.workflowId || undefined);
    }
  }

  private resolveIdempotencyKey(
    type: string,
    organizationId: string,
    referenceId: string,
    providedKey?: string,
  ): string {
    if (providedKey && providedKey.trim().length > 0) {
      return providedKey.trim();
    }

    if (isSideEffectingJobType(type)) {
      throw new MissingIdempotencyKeyError(type);
    }

    return `${organizationId}:${type}:${referenceId}:${crypto.randomUUID()}`;
  }
}

export const workflowJobQueue = new WorkflowJobQueue();
