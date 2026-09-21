import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * System metadata table used for operational status, migrations tracking,
 * and baseline schema validation.
 */
export const systemMeta = pgTable('system_meta', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SystemMeta = typeof systemMeta.$inferSelect;
export type NewSystemMeta = typeof systemMeta.$inferInsert;

export * from './organizations';
export * from './auth';
export * from './articles';
export * from './sites';
export * from './connections';
export * from './publishing';
export * from './analytics';
export * from './transformations';
export * from './assets';
export * from './profiles';
