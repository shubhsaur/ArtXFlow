import { pgEnum, pgTable, text, timestamp, unique, uuid, index } from 'drizzle-orm/pg-core';
import { user } from './auth';

/**
 * Membership roles within an organization.
 */
export const membershipRoleEnum = pgEnum('membership_role', ['OWNER', 'MEMBER']);

export type MembershipRole = (typeof membershipRoleEnum.enumValues)[number];

/**
 * Organizations table - tenant boundary for all product data.
 */
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('organizations_slug_unique').on(table.slug),
    index('organizations_slug_idx').on(table.slug),
  ],
);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

/**
 * Memberships table - connects users to organizations with role-based access.
 */
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: membershipRoleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique('memberships_org_user_unique').on(table.organizationId, table.userId),
    index('memberships_org_idx').on(table.organizationId),
    index('memberships_user_idx').on(table.userId),
  ],
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
