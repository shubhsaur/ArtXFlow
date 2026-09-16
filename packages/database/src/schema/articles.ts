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
import { user } from './auth';

/**
 * Article lifecycle status enum.
 */
export const articleStatusEnum = pgEnum('article_status', ['DRAFT', 'READY', 'ARCHIVED']);

export type ArticleStatus = (typeof articleStatusEnum.enumValues)[number];

/**
 * Canonical Articles table - the core source of truth for all content.
 */
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    authorId: text('author_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    excerpt: text('excerpt'),
    status: articleStatusEnum('status').notNull().default('DRAFT'),
    coverAssetId: uuid('cover_asset_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('articles_org_slug_unique').on(table.organizationId, table.slug),
    index('articles_org_idx').on(table.organizationId),
    index('articles_author_idx').on(table.authorId),
  ],
);

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

/**
 * Article Versions table - immutable historical snapshots of article content.
 * Any publishing event or external projection references a specific immutable version.
 */
export const articleVersions = pgTable(
  'article_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    content: text('content').notNull(),
    contentFormat: text('content_format').notNull().default('markdown'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdBy: text('created_by')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('article_versions_article_version_unique').on(table.articleId, table.versionNumber),
    index('article_versions_article_idx').on(table.articleId),
  ],
);

export type ArticleVersion = typeof articleVersions.$inferSelect;
export type NewArticleVersion = typeof articleVersions.$inferInsert;
