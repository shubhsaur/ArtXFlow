import type { EntityId, DestinationOverrides } from '@artxflow/types';

export type { DestinationOverrides };

/**
 * Standard identifier for external publishing platforms and internal destinations.
 */
export type PlatformProvider = 'ARTXFLOW_BLOG' | 'DEVTO' | 'HASHNODE' | 'MEDIUM' | (string & {});

/**
 * Declares the specific capabilities supported by a platform adapter.
 * Used by distribution orchestrators to decide whether to attempt updates,
 * analytics fetches, scheduling, or canonical URL synchronization.
 */
export interface PlatformCapabilities {
  /** Can create new remote posts/articles */
  create: boolean;
  /** Can update existing remote posts */
  update: boolean;
  /** Can unpublish or delete remote posts */
  delete: boolean;
  /** Can fetch engagement metrics (views, reactions, etc.) */
  analytics: boolean;
  /** Supports setting a canonical URL pointing back to the ArtXFlow canonical source */
  canonicalUrl: boolean;
  /** Supports remote image/asset uploads or cover images */
  images: boolean;
  /** Supports native platform scheduling */
  scheduling: boolean;
}

/**
 * Reference to an asset stored within ArtXFlow storage.
 */
export interface AssetReference {
  id: EntityId;
  url: string;
  mimeType?: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Canonical representation of an article within ArtXFlow.
 * This is the single source of truth passed to platform transformers.
 */
export interface CanonicalArticle {
  id: EntityId;
  versionId: EntityId;
  title: string;
  excerpt?: string | null;
  markdown: string;
  coverImage?: AssetReference | null;
  tags: string[];
  canonicalUrl?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Combines a canonical article with destination-specific overrides into an effective canonical representation.
 * Invariant: Canonical article content (markdown) is preserved; only presentation fields are customized.
 */
export function applyDestinationOverrides(
  canonical: CanonicalArticle,
  overrides?: DestinationOverrides | null,
): CanonicalArticle {
  if (!overrides) {
    return canonical;
  }

  return {
    ...canonical,
    title:
      typeof overrides.title === 'string' && overrides.title.trim().length > 0
        ? overrides.title.trim()
        : canonical.title,
    excerpt: overrides.description !== undefined ? overrides.description : canonical.excerpt,
    tags: Array.isArray(overrides.tags) ? overrides.tags : canonical.tags,
    canonicalUrl:
      overrides.canonicalUrl !== undefined ? overrides.canonicalUrl : canonical.canonicalUrl,
    metadata: {
      ...canonical.metadata,
      ...overrides.providerMetadata,
    },
  };
}

/**
 * Destination-specific projection transformed for a particular platform.
 */
export interface PlatformArticle {
  title: string;
  content: string;
  tags?: string[];
  description?: string;
  canonicalUrl?: string;
  coverImageUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validation error or warning issue on a platform article payload.
 */
export interface ValidationIssue {
  field: string;
  message: string;
  code?: string;
}

/**
 * Result of validating an article against a platform's constraints.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings?: ValidationIssue[];
}

/**
 * Abstracted credential container passed to adapters during execution.
 * Adapters never read credentials from process.env or arbitrary external state.
 */
export interface ConnectionCredentials {
  token?: string;
  apiKey?: string;
  secretKey?: string;
  oauth?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
  };
  custom?: Record<string, unknown>;
}

/**
 * Input required to publish an article to an external destination.
 */
export interface PublishInput {
  publicationId: EntityId;
  article: PlatformArticle;
  credentials?: ConnectionCredentials;
  destinationConfig?: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * Input required to update an existing remote publication.
 */
export interface UpdateInput {
  publicationId: EntityId;
  externalResourceId: string;
  article: PlatformArticle;
  credentials?: ConnectionCredentials;
  destinationConfig?: Record<string, unknown>;
}

/**
 * Input required to delete or unpublish a remote article.
 */
export interface DeleteInput {
  publicationId: EntityId;
  externalResourceId: string;
  credentials?: ConnectionCredentials;
  destinationConfig?: Record<string, unknown>;
}

/**
 * Input required to query remote metrics for a publication.
 */
export interface MetricsInput {
  publicationId: EntityId;
  externalResourceId: string;
  credentials?: ConnectionCredentials;
  destinationConfig?: Record<string, unknown>;
  since?: string;
}

/**
 * Outcome of a successful publication or update operation.
 */
export interface PublishResult {
  externalResourceId: string;
  externalUrl: string;
  publishedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Normalized metrics captured from an external platform.
 */
export interface PlatformMetrics {
  views?: number;
  reads?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  bookmarks?: number;
  raw?: Record<string, unknown>;
  capturedAt: string;
}

/**
 * Provider-agnostic publishing adapter interface contract.
 * Each external integration (DEV.to, Hashnode, Medium, ArtXFlow Site) implements this contract.
 */
export interface PlatformAdapter {
  /** Identifier of the target platform provider */
  readonly provider: PlatformProvider;

  /** Returns the static or dynamic capabilities supported by this adapter */
  getCapabilities(): PlatformCapabilities;

  /** Validates destination-specific constraints before calling remote APIs */
  validate(input: PlatformArticle): Promise<ValidationResult>;

  /** Transforms a canonical ArtXFlow article into a platform-specific projection */
  transform(article: CanonicalArticle): Promise<PlatformArticle>;

  /** Publishes a new article to the destination platform */
  publish(input: PublishInput): Promise<PublishResult>;

  /** Updates an existing remote article */
  update(input: UpdateInput): Promise<PublishResult>;

  /** Deletes or unpublishes an article from the destination */
  delete(input: DeleteInput): Promise<void>;

  /** Fetches remote engagement metrics if supported by the platform */
  fetchMetrics(input: MetricsInput): Promise<PlatformMetrics>;
}
