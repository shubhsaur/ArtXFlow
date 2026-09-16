import { pgEnum, pgTable, text, timestamp, unique, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

/**
 * Platform connection lifecycle status enum.
 */
export const connectionStatusEnum = pgEnum('connection_status', [
  'CONNECTED',
  'EXPIRED',
  'REAUTH_REQUIRED',
  'REVOKED',
]);

export type ConnectionStatus = (typeof connectionStatusEnum.enumValues)[number];

/**
 * Platform Connections table - represents external service integration / credentials.
 * Sensitive secrets are stored in encrypted_secret using authenticated AES-256-GCM.
 */
export const platformConnections = pgTable(
  'platform_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    status: connectionStatusEnum('status').notNull().default('CONNECTED'),
    encryptedSecret: text('encrypted_secret').notNull(),
    tokenMetadata: jsonb('token_metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('platform_conn_org_idx').on(table.organizationId),
    index('platform_conn_provider_idx').on(table.provider),
    index('platform_conn_status_idx').on(table.status),
  ],
);

export type PlatformConnection = typeof platformConnections.$inferSelect;
export type NewPlatformConnection = typeof platformConnections.$inferInsert;

/**
 * Platform Accounts table - represents an author/user identity on an external platform.
 */
export const platformAccounts = pgTable(
  'platform_accounts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    connectionId: uuid('connection_id')
      .notNull()
      .references(() => platformConnections.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    username: text('username').notNull(),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('platform_acc_conn_ext_unique').on(table.connectionId, table.externalId),
    index('platform_acc_conn_idx').on(table.connectionId),
    index('platform_acc_username_idx').on(table.username),
  ],
);

export type PlatformAccount = typeof platformAccounts.$inferSelect;
export type NewPlatformAccount = typeof platformAccounts.$inferInsert;
