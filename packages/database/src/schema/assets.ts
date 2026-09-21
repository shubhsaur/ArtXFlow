import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

export const assetTypeEnum = pgEnum('asset_type', ['IMAGE', 'DOCUMENT']);
export type AssetType = (typeof assetTypeEnum.enumValues)[number];

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    type: assetTypeEnum('type').notNull().default('IMAGE'),
    storageKey: text('storage_key').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    width: integer('width'),
    height: integer('height'),
    url: text('url').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('assets_org_idx').on(table.organizationId),
    index('assets_storage_key_idx').on(table.storageKey),
  ],
);

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
