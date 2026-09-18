/**
 * Inngest event names and strongly-typed payload schemas for ArtXFlow workflows.
 * By design rules, payloads pass identifiers (IDs) rather than full entities.
 */

export const INNGEST_EVENTS = {
  DISTRIBUTION_REQUESTED: 'artxflow/distribution.requested',
  PUBLICATION_REQUESTED: 'artxflow/publication.requested',
  PUBLICATION_RETRY_REQUESTED: 'artxflow/publication.retry_requested',
  SCHEDULE_CREATED: 'artxflow/schedule.created',
  ANALYTICS_SYNC_REQUESTED: 'artxflow/analytics.sync_requested',
} as const;

export interface DistributionRequestedPayload {
  distributionId: string;
  organizationId: string;
  correlationId: string;
  publicationIds?: string[];
  destinationIds?: string[];
}

export interface PublicationRequestedPayload {
  publicationId: string;
  organizationId: string;
  correlationId: string;
  idempotencyKey?: string;
}

export interface PublicationRetryRequestedPayload {
  publicationId: string;
  organizationId: string;
  correlationId: string;
}

export interface ScheduleCreatedPayload {
  scheduleId: string;
  organizationId: string;
  articleVersionId: string;
  scheduledAt: string;
  correlationId: string;
}

export interface AnalyticsSyncRequestedPayload {
  publicationId: string;
  organizationId: string;
  correlationId?: string;
}

export type InngestEvents = {
  [INNGEST_EVENTS.DISTRIBUTION_REQUESTED]: {
    data: DistributionRequestedPayload;
  };
  [INNGEST_EVENTS.PUBLICATION_REQUESTED]: {
    data: PublicationRequestedPayload;
  };
  [INNGEST_EVENTS.PUBLICATION_RETRY_REQUESTED]: {
    data: PublicationRetryRequestedPayload;
  };
  [INNGEST_EVENTS.SCHEDULE_CREATED]: {
    data: ScheduleCreatedPayload;
  };
  [INNGEST_EVENTS.ANALYTICS_SYNC_REQUESTED]: {
    data: AnalyticsSyncRequestedPayload;
  };
};
