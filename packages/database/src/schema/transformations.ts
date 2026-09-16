import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { articleVersions } from './articles';
import { destinations } from './publishing';

/**
 * Transformation status enum values:
 * - PENDING_APPROVAL: AI or automated output requires explicit user review
 * - APPROVED: Verified and approved by user for publishing
 * - REJECTED: User discarded generated output
 * - APPLIED: Integrated into effective publishing payload
 */
export type TransformationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'APPLIED';

/**
 * Transformations table.
 * Stores deterministic and AI-generated adaptations of canonical article versions.
 * Invariant: All AI-generated content is held as a reviewable artifact until explicitly approved.
 */
export const transformations = pgTable(
  'transformations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    articleVersionId: uuid('article_version_id')
      .notNull()
      .references(() => articleVersions.id, { onDelete: 'cascade' }),
    destinationId: uuid('destination_id').references(() => destinations.id, {
      onDelete: 'cascade',
    }),
    kind: text('kind').notNull(),
    provider: text('provider'),
    inputHash: text('input_hash').notNull(),
    outputContent: text('output_content').notNull(),
    outputMetadata: jsonb('output_metadata').$type<Record<string, unknown>>().notNull().default({}),
    status: text('status').$type<TransformationStatus>().notNull().default('PENDING_APPROVAL'),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedByUserId: uuid('approved_by_user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('transformations_org_idx').on(table.organizationId),
    index('transformations_version_idx').on(table.articleVersionId),
    index('transformations_dest_idx').on(table.destinationId),
    index('transformations_status_idx').on(table.status),
  ],
);

export type Transformation = typeof transformations.$inferSelect;
export type NewTransformation = typeof transformations.$inferInsert;
