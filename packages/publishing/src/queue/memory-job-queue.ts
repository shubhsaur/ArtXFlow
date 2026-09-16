import {
  isSideEffectingJobType,
  type JobQueue,
  type EnqueueJobInput,
  type EnqueueJobResult,
  type ScheduleJobInput,
  type ScheduleJobResult,
  type CancelJobInput,
} from './job-queue';
import { MissingIdempotencyKeyError, JobCancellationError } from '../errors';

interface MemoryJob {
  id: string;
  type: string;
  organizationId: string;
  referenceType: string;
  referenceId: string;
  idempotencyKey: string;
  status: 'QUEUED' | 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  payload: Record<string, unknown>;
  scheduledAt?: string;
  enqueuedAt: string;
}

/**
 * In-memory implementation of JobQueue for tests and offline execution.
 */
export class MemoryJobQueue implements JobQueue {
  private jobs = new Map<string, MemoryJob>();
  private jobsByIdempotencyKey = new Map<string, string>();

  async enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult> {
    const key = this.resolveIdempotencyKey(
      input.type,
      input.organizationId,
      input.referenceId,
      input.idempotencyKey,
    );

    const existingId = this.jobsByIdempotencyKey.get(key);
    if (existingId) {
      const existing = this.jobs.get(existingId);
      if (existing) {
        return {
          jobId: existing.id,
          idempotencyKey: key,
          status: 'ALREADY_EXISTS',
          workflowJobId: existing.id,
          enqueuedAt: existing.enqueuedAt,
        };
      }
    }

    const id = `mem-job-${crypto.randomUUID()}`;
    const enqueuedAt = new Date().toISOString();

    const job: MemoryJob = {
      id,
      type: input.type,
      organizationId: input.organizationId,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      idempotencyKey: key,
      status: 'QUEUED',
      payload: input.payload || {},
      enqueuedAt,
    };

    this.jobs.set(id, job);
    this.jobsByIdempotencyKey.set(key, id);

    return {
      jobId: id,
      idempotencyKey: key,
      status: 'QUEUED',
      workflowJobId: id,
      enqueuedAt,
    };
  }

  async schedule(input: ScheduleJobInput): Promise<ScheduleJobResult> {
    const key = this.resolveIdempotencyKey(
      input.type,
      input.organizationId,
      input.referenceId,
      input.idempotencyKey,
    );

    const scheduledDate =
      typeof input.scheduledAt === 'string' ? new Date(input.scheduledAt) : input.scheduledAt;

    const existingId = this.jobsByIdempotencyKey.get(key);
    if (existingId) {
      const existing = this.jobs.get(existingId);
      if (existing) {
        return {
          jobId: existing.id,
          idempotencyKey: key,
          status: 'ALREADY_EXISTS',
          scheduledAt: scheduledDate.toISOString(),
          workflowJobId: existing.id,
        };
      }
    }

    const id = `mem-job-${crypto.randomUUID()}`;
    const enqueuedAt = new Date().toISOString();

    const job: MemoryJob = {
      id,
      type: input.type,
      organizationId: input.organizationId,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      idempotencyKey: key,
      status: 'SCHEDULED',
      payload: input.payload || {},
      scheduledAt: scheduledDate.toISOString(),
      enqueuedAt,
    };

    this.jobs.set(id, job);
    this.jobsByIdempotencyKey.set(key, id);

    return {
      jobId: id,
      idempotencyKey: key,
      status: 'SCHEDULED',
      scheduledAt: scheduledDate.toISOString(),
      workflowJobId: id,
    };
  }

  async cancel(input: CancelJobInput): Promise<void> {
    let job: MemoryJob | undefined;

    if (input.jobId) {
      job = this.jobs.get(input.jobId);
    } else if (input.idempotencyKey) {
      const id = this.jobsByIdempotencyKey.get(input.idempotencyKey);
      if (id) {
        job = this.jobs.get(id);
      }
    } else {
      throw new JobCancellationError('Either jobId or idempotencyKey must be provided');
    }

    if (!job || job.organizationId !== input.organizationId) {
      throw new JobCancellationError(`Job not found in organization '${input.organizationId}'`);
    }

    if (job.status === 'COMPLETED' || job.status === 'RUNNING') {
      throw new JobCancellationError(`Cannot cancel job in status '${job.status}'`);
    }

    job.status = 'CANCELED';
  }

  getJob(id: string): MemoryJob | undefined {
    return this.jobs.get(id);
  }

  listJobs(): MemoryJob[] {
    return Array.from(this.jobs.values());
  }

  clear(): void {
    this.jobs.clear();
    this.jobsByIdempotencyKey.clear();
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
