import type {
  EntityId,
  PublicationStatus,
  DestinationType,
  DestinationStatus,
  PublicationEventType,
  ScheduleStatus,
} from '@artxflow/types';
import type {
  Destination,
  Publication,
  PublicationEvent,
  WorkflowJob,
  PlatformConnection,
  PlatformAccount,
  ConnectionStatus,
  Schedule,
} from '@artxflow/database';

/**
 * Clean data transfer object for a Destination.
 * Prevents raw database models from leaking upward into UI/API layers.
 */
export interface DestinationDto {
  id: EntityId;
  organizationId: EntityId;
  type: DestinationType;
  name: string;
  connectionId?: string | null;
  siteId?: string | null;
  config: Record<string, unknown>;
  status: DestinationStatus | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Clean data transfer object for a Publication.
 */
export interface PublicationDto {
  id: EntityId;
  organizationId: EntityId;
  articleId: EntityId;
  articleVersionId: EntityId;
  destinationId: EntityId;
  status: PublicationStatus;
  externalResourceId?: string | null;
  externalUrl?: string | null;
  publishedAt?: string | null;
  lastAttemptAt?: string | null;
  attemptCount: number;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  overrides: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Clean data transfer object for a PublicationEvent.
 * Append-only audit record.
 */
export interface PublicationEventDto {
  id: EntityId;
  publicationId: EntityId;
  eventType: PublicationEventType | string;
  correlationId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/**
 * Clean data transfer object for a WorkflowJob.
 */
export interface WorkflowJobDto {
  id: EntityId;
  organizationId: EntityId;
  type: string;
  status: string;
  referenceType: string;
  referenceId: EntityId;
  idempotencyKey: string;
  workflowId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a raw database Destination entity to a clean DestinationDto.
 */
export function toDestinationDto(entity: Destination): DestinationDto {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    type: entity.type as DestinationType,
    name: entity.name,
    connectionId: entity.connectionId,
    siteId: entity.siteId,
    config: entity.config as Record<string, unknown>,
    status: entity.status as DestinationStatus,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Maps a raw database Publication entity to a clean PublicationDto.
 */
export function toPublicationDto(entity: Publication): PublicationDto {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    articleId: entity.articleId,
    articleVersionId: entity.articleVersionId,
    destinationId: entity.destinationId,
    status: entity.status as PublicationStatus,
    externalResourceId: entity.externalResourceId,
    externalUrl: entity.externalUrl,
    publishedAt: entity.publishedAt ? entity.publishedAt.toISOString() : null,
    lastAttemptAt: entity.lastAttemptAt ? entity.lastAttemptAt.toISOString() : null,
    attemptCount: entity.attemptCount,
    lastErrorCode: entity.lastErrorCode,
    lastErrorMessage: entity.lastErrorMessage,
    overrides: (entity.overrides as Record<string, unknown>) || {},
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Maps a raw database PublicationEvent entity to a clean PublicationEventDto.
 */
export function toPublicationEventDto(entity: PublicationEvent): PublicationEventDto {
  return {
    id: entity.id,
    publicationId: entity.publicationId,
    eventType: entity.eventType as PublicationEventType,
    correlationId: entity.correlationId,
    metadata: entity.metadata as Record<string, unknown>,
    createdAt: entity.createdAt.toISOString(),
  };
}

/**
 * Maps a raw database WorkflowJob entity to a clean WorkflowJobDto.
 */
export function toWorkflowJobDto(entity: WorkflowJob): WorkflowJobDto {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    type: entity.type,
    status: entity.status,
    referenceType: entity.referenceType,
    referenceId: entity.referenceId,
    idempotencyKey: entity.idempotencyKey,
    workflowId: entity.workflowId,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Clean data transfer object for a PlatformConnection.
 * Invariant: encryptedSecret and raw credentials are NEVER exposed in DTOs.
 */
export interface PlatformConnectionDto {
  id: EntityId;
  organizationId: EntityId;
  provider: string;
  status: ConnectionStatus | string;
  tokenMetadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Clean data transfer object for a PlatformAccount.
 */
export interface PlatformAccountDto {
  id: EntityId;
  connectionId: EntityId;
  externalId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a raw database PlatformConnection entity to a clean PlatformConnectionDto.
 * Strips encryptedSecret completely.
 */
export function toPlatformConnectionDto(entity: PlatformConnection): PlatformConnectionDto {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    provider: entity.provider,
    status: entity.status,
    tokenMetadata: (entity.tokenMetadata as Record<string, unknown>) || {},
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Maps a raw database PlatformAccount entity to a clean PlatformAccountDto.
 */
export function toPlatformAccountDto(entity: PlatformAccount): PlatformAccountDto {
  return {
    id: entity.id,
    connectionId: entity.connectionId,
    externalId: entity.externalId,
    username: entity.username,
    displayName: entity.displayName,
    avatarUrl: entity.avatarUrl,
    metadata: (entity.metadata as Record<string, unknown>) || {},
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Clean data transfer object for a Schedule.
 */
export interface ScheduleDto {
  id: EntityId;
  organizationId: EntityId;
  articleId: EntityId;
  articleVersionId: EntityId;
  destinationIds: string[];
  destinationOverrides: Record<string, unknown>;
  scheduledAt: string;
  timezone: string;
  status: ScheduleStatus;
  workflowId?: string | null;
  errorMessage?: string | null;
  errorCode?: string | null;
  executedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a raw database Schedule entity to a clean ScheduleDto.
 */
export function toScheduleDto(entity: Schedule): ScheduleDto {
  return {
    id: entity.id,
    organizationId: entity.organizationId,
    articleId: entity.articleId,
    articleVersionId: entity.articleVersionId,
    destinationIds: (entity.destinationIds as string[]) || [],
    destinationOverrides: (entity.destinationOverrides as Record<string, unknown>) || {},
    scheduledAt: entity.scheduledAt.toISOString(),
    timezone: entity.timezone,
    status: entity.status as ScheduleStatus,
    workflowId: entity.workflowId,
    errorMessage: entity.errorMessage,
    errorCode: entity.errorCode,
    executedAt: entity.executedAt ? entity.executedAt.toISOString() : null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
