import {
  pgTable,
  text,
  timestamp,
  uuid,
  bigint,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { publications, destinations } from './publishing';

/**
 * Analytics Snapshots table.
 * Stores point-in-time metrics captures across publishing destinations.
 * Invariant: Normalized metric columns are standardized, while provider-specific
 * telemetry is preserved inside the `metrics` JSONB payload (ADR-012).
 */
export const analyticsSnapshots = pgTable(
  'analytics_snapshots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    publicationId: uuid('publication_id')
      .notNull()
      .references(() => publications.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id').references(() => destinations.id, {
      onDelete: 'cascade',
    }),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
    views: bigint('views', { mode: 'number' }).default(0),
    likes: bigint('likes', { mode: 'number' }).default(0),
    comments: bigint('comments', { mode: 'number' }).default(0),
    shares: bigint('shares', { mode: 'number' }).default(0),
    bookmarks: bigint('bookmarks', { mode: 'number' }).default(0),
    metrics: jsonb('metrics').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('analytics_snapshots_org_idx').on(table.organizationId),
    index('analytics_snapshots_pub_captured_idx').on(table.publicationId, table.capturedAt),
    index('analytics_snapshots_dest_idx').on(table.destinationId),
  ],
);

export type AnalyticsSnapshot = typeof analyticsSnapshots.$inferSelect;
export type NewAnalyticsSnapshot = typeof analyticsSnapshots.$inferInsert;

/**
 * Analytics Raw Events table.
 * Append-only telemetry log for ingestion events, raw webhooks, sync operations,
 * and external provider responses.
 */
export const analyticsRawEvents = pgTable(
  'analytics_raw_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    publicationId: uuid('publication_id').references(() => publications.id, {
      onDelete: 'cascade',
    }),
    destinationId: uuid('destination_id').references(() => destinations.id, {
      onDelete: 'cascade',
    }),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('analytics_raw_events_org_idx').on(table.organizationId),
    index('analytics_raw_events_pub_idx').on(table.publicationId),
    index('analytics_raw_events_dest_idx').on(table.destinationId),
    index('analytics_raw_events_type_idx').on(table.eventType),
  ],
);

export type AnalyticsRawEvent = typeof analyticsRawEvents.$inferSelect;
export type NewAnalyticsRawEvent = typeof analyticsRawEvents.$inferInsert;
