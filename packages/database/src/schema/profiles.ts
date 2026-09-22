import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth';

/**
 * User Profiles table - stores canonical author profile metadata,
 * public syndication handles, and distribution notification preferences.
 */
export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  username: text('username'),
  jobTitle: text('job_title'),
  canonicalUrl: text('canonical_url'),
  bio: text('bio'),
  publicEmail: text('public_email'),
  githubHandle: text('github_handle'),
  devtoHandle: text('devto_handle'),
  hashnodeHandle: text('hashnode_handle'),
  twitterHandle: text('twitter_handle'),
  notifySuccess: boolean('notify_success').default(true).notNull(),
  notifyFailure: boolean('notify_failure').default(true).notNull(),
  notifyWeeklyDigest: boolean('notify_weekly_digest').default(false).notNull(),
  launchpadDismissed: boolean('launchpad_dismissed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
