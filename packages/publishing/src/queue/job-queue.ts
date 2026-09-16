import type { EntityId } from '@artxflow/types';

/**
 * Standard asynchronous job types managed by ArtXFlow workflow orchestrators.
 */
export type JobType =
  | 'PUBLISH_DESTINATION'
  | 'DISTRIBUTE_ARTICLE'
  | 'RETRY_PUBLICATION'
  | 'SYNC_ANALYTICS'
  | 'TRANSFORM_CONTENT'
  | 'SCHEDULE_ARTICLE'
  | (string & {});

/**
 * Determines whether a job type is externally side-effecting and strictly requires
 * an explicit idempotency key.
 */
export function isSideEffectingJobType(type: JobType): boolean {
  switch (type) {
    case 'PUBLISH_DESTINATION':
    case 'RETRY_PUBLICATION':
      return true;
    default:
      return false;
  }
}

export type JobPriority = 'low' | 'normal' | 'high';

/**
 * Input required to enqueue an immediate asynchronous job.
 */
export interface EnqueueJobInput {
  type: JobType;
  organizationId: EntityId;
  referenceType: 'PUBLICATION' | 'ARTICLE' | 'SCHEDULE' | string;
  referenceId: EntityId;
  /** Required for externally side-effecting jobs */
  idempotencyKey?: string;
  payload?: Record<string, unknown>;
  correlationId?: string;
  priority?: JobPriority;
}

/**
 * Result returned upon enqueueing a job.
 */
export interface EnqueueJobResult {
  jobId: string;
  idempotencyKey: string;
  status: 'QUEUED' | 'ALREADY_EXISTS';
  workflowJobId?: string;
  enqueuedAt: string;
}

/**
 * Input required to schedule a future asynchronous job.
 */
export interface ScheduleJobInput {
  type: JobType;
  organizationId: EntityId;
  referenceType: 'PUBLICATION' | 'ARTICLE' | 'SCHEDULE' | string;
  referenceId: EntityId;
  /** Required for externally side-effecting jobs */
  idempotencyKey?: string;
  payload?: Record<string, unknown>;
  scheduledAt: Date | string;
  timezone?: string;
  correlationId?: string;
}

/**
 * Result returned upon scheduling a future job.
 */
export interface ScheduleJobResult {
  jobId: string;
  idempotencyKey: string;
  status: 'SCHEDULED' | 'ALREADY_EXISTS';
  scheduledAt: string;
  workflowJobId?: string;
}

/**
 * Input required to cancel a queued or scheduled job.
 */
export interface CancelJobInput {
  organizationId: EntityId;
  jobId?: string;
  idempotencyKey?: string;
  reason?: string;
}

/**
 * Transport dispatcher interface.
 * Implemented by infrastructure transports (such as Inngest in apps/worker)
 * without leaking transport-specific types into domain packages.
 */
export interface JobDispatcher {
  dispatch(job: {
    id: string;
    type: string;
    idempotencyKey: string;
    organizationId: string;
    payload: Record<string, unknown>;
    correlationId?: string;
  }): Promise<string | undefined>;

  schedule(job: {
    id: string;
    type: string;
    idempotencyKey: string;
    organizationId: string;
    payload: Record<string, unknown>;
    scheduledAt: Date;
    correlationId?: string;
  }): Promise<string | undefined>;

  cancel(jobId: string, externalWorkflowId?: string): Promise<void>;
}

/**
 * Provider-neutral abstraction over asynchronous workflow execution.
 * Allows core domain code to enqueue, schedule, and cancel background workflows
 * without importing or coupling to Inngest or any specific message broker.
 */
export interface JobQueue {
  enqueue(input: EnqueueJobInput): Promise<EnqueueJobResult>;
  schedule(input: ScheduleJobInput): Promise<ScheduleJobResult>;
  cancel(input: CancelJobInput): Promise<void>;
}
