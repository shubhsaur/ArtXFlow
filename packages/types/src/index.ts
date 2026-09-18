/**
 * @artxflow/types
 * Core cross-domain shared types and primitives.
 */

export type EntityId = string;

export type Timestamp = string;

export type OrganizationRole = 'owner' | 'admin' | 'member';

export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type PublicationStatus =
  'PENDING' | 'QUEUED' | 'PUBLISHING' | 'PUBLISHED' | 'RETRYING' | 'FAILED' | 'UNKNOWN_OUTCOME';

export type DistributionStatus =
  'PENDING' | 'IN_PROGRESS' | 'PUBLISHED' | 'PARTIALLY_PUBLISHED' | 'FAILED';

export type DestinationType = 'SITE' | 'DEVTO' | 'MEDIUM' | 'HASHNODE' | string;

export type DestinationStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type PublicationEventType =
  | 'QUEUED'
  | 'STARTED'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'RETRY_SCHEDULED'
  | 'UNKNOWN_OUTCOME'
  | 'UPDATED'
  | 'DELETED';

export type ScheduleStatus = 'SCHEDULED' | 'EXECUTING' | 'COMPLETED' | 'CANCELED' | 'FAILED';

export * from './hashnode-publish-mode';
export * from './medium-publish-mode';
export * from './client-managed-publish';

export interface DestinationOverrides {
  title?: string;
  description?: string;
  tags?: string[];
  canonicalUrl?: string;
  providerMetadata?: Record<string, unknown>;
  [key: string]: unknown;
}
