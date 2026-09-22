import { z } from 'zod';
import { NextResponse } from 'next/server';
import { apiKeyScopes } from '@artxflow/database';

/**
 * Shared request-body validation schemas and helpers for API routes.
 * All untrusted input from clients MUST pass through these schemas.
 */

// ---- Limits ----------------------------------------------------------------

export const LIMITS = {
  title: 500,
  name: 200,
  slug: 200,
  excerpt: 2000,
  /** ~500 KB of text — generous for long-form articles, guards against abuse. */
  content: 500_000,
  bio: 240,
  handle: 100,
  url: 2048,
  secret: 4096,
  /** Max keys in an arbitrary metadata/config object. */
  recordKeys: 100,
} as const;

// ---- Primitive field schemas ------------------------------------------------

const boundedRecord = z
  .record(z.string().max(1000), z.unknown())
  .refine((obj) => Object.keys(obj).length <= LIMITS.recordKeys, {
    message: `Object must not have more than ${LIMITS.recordKeys} keys`,
  });

const slugSchema = z
  .string()
  .min(1)
  .max(LIMITS.slug)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with dashes');

// ---- Route schemas ----------------------------------------------------------

export const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(LIMITS.title),
  slug: slugSchema.optional(),
  excerpt: z.string().max(LIMITS.excerpt).optional(),
  content: z.string().max(LIMITS.content).optional(),
  contentFormat: z.enum(['MARKDOWN', 'HTML']).optional(),
  coverAssetId: z.string().max(100).nullish(),
  metadata: boundedRecord.optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(LIMITS.title).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(LIMITS.excerpt).optional(),
  status: z.enum(['DRAFT', 'READY', 'ARCHIVED']).optional(),
  coverAssetId: z.string().max(100).nullish(),
  content: z.string().max(LIMITS.content).optional(),
  contentFormat: z.enum(['MARKDOWN', 'HTML']).optional(),
  metadata: boundedRecord.optional(),
});

const destinationOverridesSchema = z.record(
  z.string().max(100),
  z.object({
    title: z.string().max(LIMITS.title).optional(),
    excerpt: z.string().max(LIMITS.excerpt).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    canonicalUrl: z.string().url().max(LIMITS.url).optional(),
    content: z.string().max(LIMITS.content).optional(),
    publicationId: z.string().max(200).optional(),
  }),
);

export const publishArticleSchema = z.object({
  destinationIds: z.array(z.string().min(1).max(100)).max(50).optional(),
  articleVersionId: z.string().max(100).optional(),
  destinationOverrides: destinationOverridesSchema.optional(),
});
export const recordExternalPublicationSchema = z.object({
  externalUrl: z.string({ required_error: 'externalUrl is required' }).url('externalUrl must be a valid URL').max(LIMITS.url),
  externalResourceId: z.string().max(500).optional(),
});

export const createConnectionSchema = z.object({
  provider: z
    .string({ required_error: 'Provider is required' })
    .min(1, 'Provider is required')
    .max(50),
  secret: z.string().max(LIMITS.secret).optional(),
  tokenMetadata: boundedRecord.optional(),
  hashnodePublishMode: z.enum(['extension', 'hn_new', 'manual', 'api']).optional(),
  mediumPublishMode: z.enum(['extension', 'medium_new', 'manual', 'api']).optional(),
});

export const updateConnectionSchema = z.object({
  id: z.string({ required_error: 'Connection ID is required' }).min(1, 'Connection ID is required').max(100),
  tokenMetadata: boundedRecord.optional(),
  hashnodePublishMode: z.enum(['extension', 'hn_new', 'manual', 'api']).optional(),
  mediumPublishMode: z.enum(['extension', 'medium_new', 'manual', 'api']).optional(),
});

export const createDestinationSchema = z.object({
  type: z.string().min(1, 'Destination type is required').max(50),
  name: z.string().min(1, 'Name is required').max(LIMITS.name),
  siteId: z.string().max(100).optional(),
  connectionId: z.string().max(100).optional(),
  config: boundedRecord.optional(),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(LIMITS.name),
  scopes: z
    .array(z.enum(apiKeyScopes), {
      required_error: 'At least one scope is required',
    })
    .min(1, 'At least one scope is required')
    .max(apiKeyScopes.length),
});

export const updateEmailSchema = z.object({
  email: z.string().email('A valid email address is required').max(320),
});

const optionalHandle = z
  .string()
  .max(LIMITS.handle)
  .regex(/^@?[a-zA-Z0-9_-]*$/, 'Handle may only contain letters, numbers, dashes and underscores')
  .nullish();

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(LIMITS.name).optional(),
  username: z.string().max(LIMITS.handle).optional(),
  jobTitle: z.string().max(LIMITS.name).nullish(),
  canonicalUrl: z.string().url().max(LIMITS.url).nullish(),
  bio: z
    .string()
    .max(LIMITS.bio, 'Author bio must not exceed 240 characters.')
    .nullish(),
  publicEmail: z.string().email().max(320).nullish(),
  githubHandle: optionalHandle,
  devtoHandle: optionalHandle,
  hashnodeHandle: optionalHandle,
  twitterHandle: optionalHandle,
  notifySuccess: z.boolean().optional(),
  notifyFailure: z.boolean().optional(),
  notifyWeeklyDigest: z.boolean().optional(),
});

export const onboardingLaunchSchema = z.object({
  createSampleArticle: z.boolean().optional(),
  canonicalUrl: z.string().url().max(LIMITS.url).optional(),
});

// ---- Helper -----------------------------------------------------------------

export type ParsedBody<T> = { data: T; error?: never } | { data?: never; error: NextResponse };

/**
 * Parses and validates a JSON request body against a Zod schema.
 * Returns `{ data }` on success or `{ error }` (a ready-to-return 400 response).
 */
export async function parseJsonBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<ParsedBody<z.infer<S>>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      error: NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.slice(0, 5).map((issue) => {
      const path = issue.path.join('.');
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    return {
      error: NextResponse.json({ error: 'Validation failed', details: issues }, { status: 400 }),
    };
  }

  return { data: result.data };
}


export const scheduleArticleSchema = z.object({
  scheduledAt: z
    .string({ required_error: 'scheduledAt is required' })
    .datetime({ offset: true, message: 'scheduledAt must be a valid ISO 8601 datetime' }),
  timezone: z.string().max(100).optional(),
  destinationIds: z.array(z.string().min(1).max(100)).max(50).optional(),
  articleVersionId: z.string().max(100).optional(),
  destinationOverrides: destinationOverridesSchema.optional(),
});
