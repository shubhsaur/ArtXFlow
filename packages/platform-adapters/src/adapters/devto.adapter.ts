import type {
  PlatformAdapter,
  PlatformCapabilities,
  PlatformProvider,
  PlatformArticle,
  CanonicalArticle,
  ValidationResult,
  ValidationIssue,
  PublishInput,
  PublishResult,
  UpdateInput,
  DeleteInput,
  MetricsInput,
  PlatformMetrics,
} from '../contract';
import { PlatformError } from '../errors';

export interface DevtoAdapterOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export interface DevtoAccountProfile {
  externalId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
}

interface DevtoArticleResponse {
  id: number;
  title: string;
  description?: string;
  published: boolean;
  published_at?: string;
  url: string;
  canonical_url?: string;
  slug?: string;
  path?: string;
  page_views_count?: number;
  public_reactions_count?: number;
  comments_count?: number;
  reading_time_minutes?: number;
}

interface DevtoUserResponse {
  id: number;
  username: string;
  name: string;
  summary?: string;
  profile_image?: string;
}

/**
 * DEV.to platform adapter.
 * Handles article creation, updating, unpublishing, engagement metrics,
 * canonical URL preservation, and provider error classification.
 */
export class DevtoAdapter implements PlatformAdapter {
  readonly provider: PlatformProvider = 'DEVTO';

  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: DevtoAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://dev.to/api').replace(/\/$/, '');
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  getCapabilities(): PlatformCapabilities {
    return {
      create: true,
      update: true,
      delete: true,
      analytics: true,
      canonicalUrl: true,
      images: true,
      scheduling: false,
    };
  }

  /**
   * Transforms a canonical ArtXFlow article into a DEV.to projection.
   * DEV.to accepts up to 4 tags, lowercase alphanumeric, max 30 characters each.
   * Preserves canonicalUrl and description.
   */
  async transform(article: CanonicalArticle): Promise<PlatformArticle> {
    const rawTags = article.tags || [];
    const sanitizedTags = rawTags
      .map((tag) =>
        tag
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 30),
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 4);

    return {
      title: article.title,
      content: article.markdown,
      description: article.excerpt ?? undefined,
      canonicalUrl: article.canonicalUrl ?? undefined,
      coverImageUrl: article.coverImage?.url ?? undefined,
      tags: sanitizedTags,
      metadata: {
        canonicalArticleId: article.id,
        versionId: article.versionId,
      },
    };
  }

  /**
   * Validates article constraints against DEV.to platform limits.
   */
  async validate(input: PlatformArticle): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!input.title || !input.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Article title is required and cannot be empty.',
      });
    }

    if (!input.content || !input.content.trim()) {
      errors.push({
        field: 'content',
        message: 'Article content/body_markdown is required.',
      });
    }

    if (input.tags && input.tags.length > 4) {
      errors.push({
        field: 'tags',
        message: 'DEV.to allows a maximum of 4 tags.',
      });
    }

    if (input.tags) {
      for (const tag of input.tags) {
        if (tag.length > 30) {
          errors.push({
            field: 'tags',
            message: `Tag '${tag}' exceeds DEV.to maximum length of 30 characters.`,
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Publishes an article to DEV.to.
   */
  async publish(input: PublishInput): Promise<PublishResult> {
    const apiKey = this.extractApiKey(input.credentials);

    const payload = {
      article: {
        title: input.article.title,
        body_markdown: input.article.content,
        published: true,
        canonical_url: input.article.canonicalUrl || undefined,
        description: input.article.description || undefined,
        tags: input.article.tags && input.article.tags.length > 0 ? input.article.tags : undefined,
        main_image: input.article.coverImageUrl || undefined,
      },
    };

    const response = await this.executeRequest<DevtoArticleResponse>(
      `${this.baseUrl}/articles`,
      {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
        body: JSON.stringify(payload),
      },
      'publish',
    );

    return {
      externalResourceId: String(response.id),
      externalUrl: response.url,
      publishedAt: response.published_at || new Date().toISOString(),
      metadata: {
        devtoId: response.id,
        slug: response.slug,
        path: response.path,
      },
    };
  }

  /**
   * Updates an existing DEV.to article.
   */
  async update(input: UpdateInput): Promise<PublishResult> {
    const apiKey = this.extractApiKey(input.credentials);

    const payload = {
      article: {
        title: input.article.title,
        body_markdown: input.article.content,
        published: true,
        canonical_url: input.article.canonicalUrl || undefined,
        description: input.article.description || undefined,
        tags: input.article.tags && input.article.tags.length > 0 ? input.article.tags : undefined,
        main_image: input.article.coverImageUrl || undefined,
      },
    };

    const response = await this.executeRequest<DevtoArticleResponse>(
      `${this.baseUrl}/articles/${encodeURIComponent(input.externalResourceId)}`,
      {
        method: 'PUT',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
        body: JSON.stringify(payload),
      },
      'update',
    );

    return {
      externalResourceId: String(response.id),
      externalUrl: response.url,
      publishedAt: response.published_at || new Date().toISOString(),
      metadata: {
        devtoId: response.id,
        slug: response.slug,
        path: response.path,
      },
    };
  }

  /**
   * Deletes or unpublishes an article from DEV.to.
   * DEV.to does not permanently delete articles via API; instead it sets published: false.
   */
  async delete(input: DeleteInput): Promise<void> {
    const apiKey = this.extractApiKey(input.credentials);

    const payload = {
      article: {
        published: false,
      },
    };

    await this.executeRequest<DevtoArticleResponse>(
      `${this.baseUrl}/articles/${encodeURIComponent(input.externalResourceId)}`,
      {
        method: 'PUT',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
        body: JSON.stringify(payload),
      },
      'delete',
    );
  }

  /**
   * Fetches engagement metrics for a DEV.to article.
   */
  async fetchMetrics(input: MetricsInput): Promise<PlatformMetrics> {
    const apiKey = this.extractApiKey(input.credentials);

    const response = await this.executeRequest<DevtoArticleResponse>(
      `${this.baseUrl}/articles/${encodeURIComponent(input.externalResourceId)}`,
      {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'User-Agent': 'ArtXFlow/1.0',
        },
      },
      'fetchMetrics',
    );

    return {
      views: response.page_views_count,
      reactions: response.public_reactions_count,
      comments: response.comments_count,
      reads: response.reading_time_minutes,
      raw: response as unknown as Record<string, unknown>,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Verifies DEV.to API key credentials and retrieves user account metadata.
   * Used when establishing a new connection.
   */
  async verifyCredentials(apiKey: string): Promise<DevtoAccountProfile> {
    if (!apiKey || !apiKey.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'DEV.to API key cannot be empty',
        retryable: false,
      });
    }

    const response = await this.executeRequest<DevtoUserResponse>(
      `${this.baseUrl}/users/me`,
      {
        method: 'GET',
        headers: {
          'api-key': apiKey.trim(),
          'User-Agent': 'ArtXFlow/1.0',
        },
      },
      'verifyCredentials',
    );

    return {
      externalId: String(response.id),
      username: response.username,
      displayName: response.name,
      avatarUrl: response.profile_image,
      metadata: {
        summary: response.summary,
      },
    };
  }

  /**
   * Extracts API key from credentials container.
   */
  private extractApiKey(credentials?: PublishInput['credentials']): string {
    const key = credentials?.apiKey || credentials?.token;
    if (!key || !key.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'DEV.to API key is required but was not provided',
        retryable: false,
      });
    }
    return key.trim();
  }

  /**
   * Executes an HTTP request with standardized DEV.to error mapping.
   */
  private async executeRequest<T>(url: string, init: RequestInit, operation: string): Promise<T> {
    let res: Response;
    try {
      res = await this.fetchFn(url, init);
    } catch (err) {
      const isTimeout =
        (err instanceof Error &&
          (err.name === 'TimeoutError' ||
            err.name === 'AbortError' ||
            /timeout/i.test(err.message))) ||
        false;

      if (isTimeout && operation === 'publish') {
        throw new PlatformError({
          provider: this.provider,
          code: 'UNKNOWN_OUTCOME',
          message: `Request timed out while creating article on DEV.to (${operation}). Remote state is unknown: ${err instanceof Error ? err.message : String(err)}`,
          retryable: false,
          rawError: err,
        });
      }

      if (isTimeout) {
        throw new PlatformError({
          provider: this.provider,
          code: 'TIMEOUT',
          message: `Request timed out while communicating with DEV.to (${operation}): ${err instanceof Error ? err.message : String(err)}`,
          retryable: true,
          rawError: err,
        });
      }

      throw new PlatformError({
        provider: this.provider,
        code: 'NETWORK_ERROR',
        message: `Network failure while communicating with DEV.to (${operation}): ${err instanceof Error ? err.message : String(err)}`,
        retryable: true,
        rawError: err,
      });
    }

    if (res.ok) {
      return (await res.json()) as T;
    }

    let responseBody: string;
    try {
      responseBody = await res.text();
    } catch {
      responseBody = '';
    }

    // Classify HTTP response codes according to ArtXFlow error semantics
    if (res.status === 401 || res.status === 403) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: `DEV.to authentication failed (${res.status}): Invalid or unauthorized API key.`,
        statusCode: res.status,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 429) {
      throw new PlatformError({
        provider: this.provider,
        code: 'RATE_LIMITED',
        message: 'DEV.to rate limit reached. Retry scheduled.',
        statusCode: 429,
        retryable: true,
        rawError: responseBody,
      });
    }

    if (res.status === 422) {
      throw new PlatformError({
        provider: this.provider,
        code: 'VALIDATION_ERROR',
        message: `DEV.to rejected the article validation: ${responseBody}`,
        statusCode: 422,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 404) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `DEV.to resource not found: ${responseBody}`,
        statusCode: 404,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 504 && operation === 'publish') {
      throw new PlatformError({
        provider: this.provider,
        code: 'UNKNOWN_OUTCOME',
        message: `DEV.to gateway timed out (504) during article creation. Remote state is unknown: ${responseBody}`,
        statusCode: 504,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status >= 500) {
      throw new PlatformError({
        provider: this.provider,
        code: 'PROVIDER_5XX',
        message: `DEV.to internal server error (${res.status}): ${responseBody}`,
        statusCode: res.status,
        retryable: true,
        rawError: responseBody,
      });
    }

    throw new PlatformError({
      provider: this.provider,
      code: 'UNKNOWN_OUTCOME',
      message: `DEV.to returned unexpected status (${res.status}): ${responseBody}`,
      statusCode: res.status,
      retryable: false,
      rawError: responseBody,
    });
  }
}

export const devtoAdapter = new DevtoAdapter();
