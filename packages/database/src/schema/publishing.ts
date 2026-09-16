import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { articles, articleVersions } from './articles';
import { sites } from './sites';
import { platformConnections } from './connections';

/**
 * Publication lifecycle status enum.
 */
export const publicationStatusEnum = pgEnum('publication_status', [
  'PENDING',
  'QUEUED',
  'PUBLISHING',
  'PUBLISHED',
  'RETRYING',
  'FAILED',
  'UNKNOWN_OUTCOME',
]);

export type PublicationStatus = (typeof publicationStatusEnum.enumValues)[number];

/**
 * Destinations table - concrete places where content can be published.
 * Links to either an internal ArtXFlow hosted site or an external platform connection.
 */
export const destinations = pgTable(
  'destinations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    name: text('name').notNull(),
    connectionId: uuid('connection_id').references(() => platformConnections.id, {
      onDelete: 'cascade',
    }),
    siteId: uuid('site_id').references(() => sites.id, { onDelete: 'cascade' }),
    config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
    status: text('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('destinations_org_idx').on(table.organizationId),
    index('destinations_site_idx').on(table.siteId),
    index('destinations_conn_idx').on(table.connectionId),
  ],
);

export type Destination = typeof destinations.$inferSelect;
export type NewDestination = typeof destinations.$inferInsert;

/**
 * Publications table - represents the relationship between an immutable
 * article version and a destination. Tracks external publication state.
 */
export const publications = pgTable(
  'publications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    articleVersionId: uuid('article_version_id')
      .notNull()
      .references(() => articleVersions.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id')
      .notNull()
      .references(() => destinations.id, { onDelete: 'cascade' }),
    status: publicationStatusEnum('status').notNull().default('PENDING'),
    externalResourceId: text('external_resource_id'),
    externalUrl: text('external_url'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    attemptCount: integer('attempt_count').notNull().default(0),
    lastErrorCode: text('last_error_code'),
    lastErrorMessage: text('last_error_message'),
    overrides: jsonb('overrides').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('publications_version_dest_unique').on(table.articleVersionId, table.destinationId),
    index('publications_org_idx').on(table.organizationId),
    index('publications_article_idx').on(table.articleId),
    index('publications_version_idx').on(table.articleVersionId),
    index('publications_dest_idx').on(table.destinationId),
    index('publications_status_idx').on(table.status),
  ],
);

export type Publication = typeof publications.$inferSelect;
export type NewPublication = typeof publications.$inferInsert;

/**
 * Publication Events table - append-only historical log of all publishing events.
 * Provides durable observability for audit and debugging across all destination workflows.
 */
export const publicationEvents = pgTable(
  'publication_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => publications.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(),
    correlationId: text('correlation_id').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('pub_events_pub_idx').on(table.publicationId),
    index('pub_events_corr_idx').on(table.correlationId),
  ],
);

export type PublicationEvent = typeof publicationEvents.$inferSelect;
export type NewPublicationEvent = typeof publicationEvents.$inferInsert;

/**
 * Workflow Jobs table - durable application records for asynchronous operations.
 * Enforces execution idempotency via unique idempotency_key.
 */
export const workflowJobs = pgTable(
  'workflow_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    status: text('status').notNull(),
    referenceType: text('reference_type').notNull(),
    referenceId: uuid('reference_id').notNull(),
    idempotencyKey: text('idempotency_key').notNull().unique(),
    workflowId: text('workflow_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('workflow_jobs_org_idx').on(table.organizationId),
    index('workflow_jobs_ref_idx').on(table.referenceType, table.referenceId),
  ],
);

export type WorkflowJob = typeof workflowJobs.$inferSelect;
export type NewWorkflowJob = typeof workflowJobs.$inferInsert;

/**
 * Schedule status enum.
 */
export const scheduleStatusEnum = pgEnum('schedule_status', [
  'SCHEDULED',
  'EXECUTING',
  'COMPLETED',
  'CANCELED',
  'FAILED',
]);

export type ScheduleStatus = (typeof scheduleStatusEnum.enumValues)[number];

/**
 * Schedules table - manages future scheduled article publications.
 * Ties an immutable article version to destinations at a future normalized UTC timestamp.
 */
export const schedules = pgTable(
  'schedules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    articleVersionId: uuid('article_version_id')
      .notNull()
      .references(() => articleVersions.id, { onDelete: 'cascade' }),
    destinationIds: jsonb('destination_ids').$type<string[]>().notNull().default([]),
    destinationOverrides: jsonb('destination_overrides')
      .$type<Record<string, Record<string, unknown>>>()
      .notNull()
      .default({}),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    timezone: text('timezone').notNull().default('UTC'),
    status: scheduleStatusEnum('status').notNull().default('SCHEDULED'),
    workflowId: text('workflow_id'),
    errorMessage: text('error_message'),
    errorCode: text('error_code'),
    executedAt: timestamp('executed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('schedules_org_idx').on(table.organizationId),
    index('schedules_article_idx').on(table.articleId),
    index('schedules_version_idx').on(table.articleVersionId),
    index('schedules_status_idx').on(table.status),
    index('schedules_scheduled_at_idx').on(table.scheduledAt),
  ],
);

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;
