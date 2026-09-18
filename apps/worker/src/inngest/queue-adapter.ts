import type { JobDispatcher } from '@artxflow/publishing';
import { WorkflowJobQueue } from '@artxflow/publishing';
import { workflowJobRepository, type WorkflowJobRepository } from '@artxflow/database';
import { inngest } from './client';
import { INNGEST_EVENTS } from './events';

/**
 * Inngest implementation of JobDispatcher.
 * Bridges ArtXFlow's provider-neutral JobQueue to Inngest event delivery
 * without exposing Inngest specifics upward to domain packages.
 */
export class InngestJobDispatcher implements JobDispatcher {
  constructor(private readonly client: typeof inngest = inngest) {}

  async dispatch(job: {
    id: string;
    type: string;
    idempotencyKey: string;
    organizationId: string;
    payload: Record<string, unknown>;
    correlationId?: string;
  }): Promise<string | undefined> {
    const correlationId = job.correlationId || crypto.randomUUID();

    if (job.type === 'PUBLISH_DESTINATION') {
      const { ids } = await this.client.send({
        name: INNGEST_EVENTS.PUBLICATION_REQUESTED,
        data: {
          publicationId: (job.payload.publicationId as string) || job.id,
          organizationId: job.organizationId,
          correlationId,
          idempotencyKey: job.idempotencyKey,
        },
      });
      return ids[0];
    }

    if (job.type === 'DISTRIBUTE_ARTICLE') {
      const { ids } = await this.client.send({
        name: INNGEST_EVENTS.DISTRIBUTION_REQUESTED,
        data: {
          distributionId:
            (job.payload.distributionId as string) ||
            (job.payload.articleVersionId as string) ||
            job.id,
          organizationId: job.organizationId,
          correlationId,
          publicationIds: job.payload.publicationIds as string[] | undefined,
          destinationIds: job.payload.destinationIds as string[] | undefined,
        },
      });
      return ids[0];
    }

    if (job.type === 'RETRY_PUBLICATION') {
      const { ids } = await this.client.send({
        name: INNGEST_EVENTS.PUBLICATION_RETRY_REQUESTED,
        data: {
          publicationId: (job.payload.publicationId as string) || job.id,
          organizationId: job.organizationId,
          correlationId,
        },
      });
      return ids[0];
    }

    if (job.type === 'SCHEDULE_ARTICLE') {
      const { ids } = await this.client.send({
        name: INNGEST_EVENTS.SCHEDULE_CREATED,
        data: {
          scheduleId: (job.payload.scheduleId as string) || job.id,
          organizationId: job.organizationId,
          articleVersionId: (job.payload.articleVersionId as string) || job.id,
          scheduledAt: (job.payload.scheduledAt as string) || new Date().toISOString(),
          correlationId,
        },
      });
      return ids[0];
    }

    if (job.type === 'SYNC_ANALYTICS') {
      const { ids } = await this.client.send({
        name: INNGEST_EVENTS.ANALYTICS_SYNC_REQUESTED,
        data: {
          publicationId: (job.payload.publicationId as string) || job.id,
          organizationId: job.organizationId,
          correlationId,
        },
      });
      return ids[0];
    }

    return undefined;
  }

  async schedule(job: {
    id: string;
    type: string;
    idempotencyKey: string;
    organizationId: string;
    payload: Record<string, unknown>;
    scheduledAt: Date;
    correlationId?: string;
  }): Promise<string | undefined> {
    const correlationId = job.correlationId || crypto.randomUUID();

    const { ids } = await this.client.send({
      name: INNGEST_EVENTS.SCHEDULE_CREATED,
      data: {
        scheduleId: (job.payload.scheduleId as string) || job.id,
        organizationId: job.organizationId,
        articleVersionId: (job.payload.articleVersionId as string) || job.id,
        scheduledAt: job.scheduledAt.toISOString(),
        correlationId,
      },
    });

    return ids[0];
  }

  async cancel(_jobId: string, _externalWorkflowId?: string): Promise<void> {
    // Inngest cancellations occur via internal status marking and/or Inngest Cancellation API
  }
}

export const inngestJobDispatcher = new InngestJobDispatcher();

/**
 * Factory creating a WorkflowJobQueue backed by the ArtXFlow database and Inngest transport.
 */
export function createInngestJobQueue(
  dbRepo: WorkflowJobRepository = workflowJobRepository,
  dispatcher: JobDispatcher = inngestJobDispatcher,
): WorkflowJobQueue {
  return new WorkflowJobQueue(dbRepo, dispatcher);
}
