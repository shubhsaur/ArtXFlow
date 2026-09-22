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
import { stripFrontmatter, formatMediumMarkdown } from '../transformers';

export interface MediumAdapterOptions {
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export interface MediumUserProfile {
  externalId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  url?: string;
}

interface MediumPostResponse {
  data: {
    id: string;
    title: string;
    authorId: string;
    url: string;
    canonicalUrl?: string;
    publishStatus: string;
    publishedAt?: number;
    tags?: string[];
  };
}

interface MediumUserResponse {
  data: {
    id: string;
    username: string;
    name: string;
    url: string;
    imageUrl?: string;
  };
}

/**
 * Medium platform adapter.
 * Handles article publishing to Medium's REST API (v1), validation,
 * canonical URL preservation, and error classification.
 */
export class MediumAdapter implements PlatformAdapter {
  readonly provider: PlatformProvider = 'MEDIUM';

  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: MediumAdapterOptions = {}) {
    this.baseUrl = (options.baseUrl ?? 'https://api.medium.com/v1').replace(/\/$/, '');
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  getCapabilities(): PlatformCapabilities {
    return {
      create: true,
      update: false,
      delete: false,
      analytics: false,
      canonicalUrl: true,
      images: false,
      scheduling: false,
    };
  }

  /**
   * Transforms a canonical ArtXFlow article into a Medium projection.
   * Medium supports up to 5 tags, max 25 chars each.
   */
  async transform(article: CanonicalArticle): Promise<PlatformArticle> {
    const rawTags = article.tags || [];
    const sanitizedTags = rawTags
      .map((tag) => tag.trim().slice(0, 25))
      .filter((tag) => tag.length > 0)
      .slice(0, 5);

    const cleanMarkdown = stripFrontmatter(article.markdown || '');
    const formattedContent = formatMediumMarkdown(cleanMarkdown);

    return {
      title: article.title,
      content: formattedContent,
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
   * Validates article constraints against Medium platform limits.
   */
  async validate(input: PlatformArticle): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!input.title || !input.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Article title is required and cannot be empty.',
      });
    } else if (input.title.length > 100) {
      errors.push({
        field: 'title',
        message: 'Article title cannot exceed 100 characters on Medium.',
      });
    }

    if (!input.content || !input.content.trim()) {
      errors.push({
        field: 'content',
        message: 'Article content/markdown is required.',
      });
    }

    if (input.tags && input.tags.length > 5) {
      errors.push({
        field: 'tags',
        message: 'Medium allows a maximum of 5 tags.',
      });
    }

    if (input.tags) {
      for (const tag of input.tags) {
        if (tag.length > 25) {
          errors.push({
            field: 'tags',
            message: `Tag '${tag}' exceeds Medium maximum length of 25 characters.`,
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
   * Publishes an article to Medium.
   */
  async publish(input: PublishInput): Promise<PublishResult> {
    const token = this.extractToken(input.credentials);

    // Resolve author ID: either from destinationConfig / credentials or via /me
    let authorId =
      (input.destinationConfig?.authorId as string | undefined) ||
      (input.credentials?.custom?.authorId as string | undefined);

    if (!authorId) {
      const userProfile = await this.verifyCredentials(token);
      authorId = userProfile.externalId;
    }

    const payload = {
      title: input.article.title,
      contentFormat: 'markdown',
      content: input.article.content,
      canonicalUrl: input.article.canonicalUrl || undefined,
      tags: input.article.tags && input.article.tags.length > 0 ? input.article.tags : undefined,
      publishStatus: (input.destinationConfig?.publishStatus as string) || 'public',
    };

    const response = await this.executeRequest<MediumPostResponse>(
      `${this.baseUrl}/users/${encodeURIComponent(authorId)}/posts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
        body: JSON.stringify(payload),
      },
      'publish',
    );

    const post = response.data;
    return {
      externalResourceId: post.id,
      externalUrl: post.url,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
      metadata: {
        mediumId: post.id,
        authorId: post.authorId,
        publishStatus: post.publishStatus,
      },
    };
  }

  /**
   * Updating existing articles is not supported by Medium API v1.
   */
  async update(_input: UpdateInput): Promise<PublishResult> {
    throw new PlatformError({
      provider: this.provider,
      code: 'UNSUPPORTED_OPERATION',
      message: 'Medium API v1 does not support updating existing posts',
      retryable: false,
    });
  }

  /**
   * Deleting articles is not supported by Medium API v1.
   */
  async delete(_input: DeleteInput): Promise<void> {
    throw new PlatformError({
      provider: this.provider,
      code: 'UNSUPPORTED_OPERATION',
      message: 'Medium API v1 does not support deleting posts',
      retryable: false,
    });
  }

  /**
   * Analytics querying is not supported by Medium public API.
   */
  async fetchMetrics(_input: MetricsInput): Promise<PlatformMetrics> {
    throw new PlatformError({
      provider: this.provider,
      code: 'UNSUPPORTED_OPERATION',
      message: 'Medium API does not support metrics retrieval',
      retryable: false,
    });
  }

  /**
   * Verifies Medium integration token and returns user profile.
   */
  async verifyCredentials(token: string): Promise<MediumUserProfile> {
    if (!token || !token.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'Medium access token cannot be empty',
        retryable: false,
      });
    }

    const response = await this.executeRequest<MediumUserResponse>(
      `${this.baseUrl}/me`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
      },
      'verifyCredentials',
    );

    return {
      externalId: response.data.id,
      username: response.data.username,
      displayName: response.data.name,
      avatarUrl: response.data.imageUrl || null,
      url: response.data.url,
    };
  }

  private extractToken(credentials?: PublishInput['credentials']): string {
    const token = credentials?.token || credentials?.apiKey || credentials?.oauth?.accessToken;
    if (!token || !token.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'Medium access token is required but was not provided',
        retryable: false,
      });
    }
    return token.trim();
  }

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
          message: `Request timed out while creating article on Medium (${operation}). Remote state is unknown: ${err instanceof Error ? err.message : String(err)}`,
          retryable: false,
          rawError: err,
        });
      }

      if (isTimeout) {
        throw new PlatformError({
          provider: this.provider,
          code: 'TIMEOUT',
          message: `Request timed out while communicating with Medium (${operation}): ${err instanceof Error ? err.message : String(err)}`,
          retryable: true,
          rawError: err,
        });
      }

      throw new PlatformError({
        provider: this.provider,
        code: 'NETWORK_ERROR',
        message: `Network failure while communicating with Medium (${operation}): ${err instanceof Error ? err.message : String(err)}`,
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

    if (res.status === 401 || res.status === 403) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: `Medium authentication failed (${res.status}): Invalid or unauthorized token.`,
        statusCode: res.status,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 429) {
      throw new PlatformError({
        provider: this.provider,
        code: 'RATE_LIMITED',
        message: 'Medium rate limit reached. Retry scheduled.',
        statusCode: 429,
        retryable: true,
        rawError: responseBody,
      });
    }

    if (res.status === 400 || res.status === 422) {
      throw new PlatformError({
        provider: this.provider,
        code: 'VALIDATION_ERROR',
        message: `Medium rejected the article validation: ${responseBody}`,
        statusCode: res.status,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 404) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Medium resource not found: ${responseBody}`,
        statusCode: 404,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 504 && operation === 'publish') {
      throw new PlatformError({
        provider: this.provider,
        code: 'UNKNOWN_OUTCOME',
        message: `Medium gateway timed out (504) during article creation. Remote state is unknown: ${responseBody}`,
        statusCode: 504,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status >= 500) {
      throw new PlatformError({
        provider: this.provider,
        code: 'PROVIDER_5XX',
        message: `Medium internal server error (${res.status}): ${responseBody}`,
        statusCode: res.status,
        retryable: true,
        rawError: responseBody,
      });
    }

    throw new PlatformError({
      provider: this.provider,
      code: 'UNKNOWN_OUTCOME',
      message: `Medium returned unexpected status (${res.status}): ${responseBody}`,
      statusCode: res.status,
      retryable: false,
      rawError: responseBody,
    });
  }
}

export const mediumAdapter = new MediumAdapter();
