import { pgEnum, pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';

/**
 * Site lifecycle status enum.
 */
export const siteStatusEnum = pgEnum('site_status', ['ACTIVE', 'MAINTENANCE', 'ARCHIVED']);

export type SiteStatus = (typeof siteStatusEnum.enumValues)[number];

/**
 * Typed configuration for site themes, stored as JSONB.
 */
export interface SiteThemeConfig {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  headerNavigation?: Array<{ label: string; url: string }>;
  footerText?: string;
  customCss?: string;
  [key: string]: unknown;
}

/**
 * Sites table - represents organization-owned hosted blogs/publications.
 * Supports <subdomain>.artxflow.com and custom domain routing.
 */
export const sites = pgTable(
  'sites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    subdomain: text('subdomain').notNull().unique(),
    customDomain: text('custom_domain').unique(),
    status: siteStatusEnum('status').notNull().default('ACTIVE'),
    themeConfig: jsonb('theme_config').$type<SiteThemeConfig>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sites_org_idx').on(table.organizationId),
    index('sites_subdomain_idx').on(table.subdomain),
    index('sites_custom_domain_idx').on(table.customDomain),
  ],
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
