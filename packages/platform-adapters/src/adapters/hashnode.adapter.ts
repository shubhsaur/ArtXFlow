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

export interface HashnodeAdapterOptions {
  apiUrl?: string;
  fetchFn?: typeof fetch;
}

export interface HashnodePublicationSummary {
  id: string;
  title: string;
  url: string;
}

export interface HashnodeUserProfile {
  externalId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  publications: HashnodePublicationSummary[];
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      [key: string]: unknown;
    };
  }>;
}

interface HashnodePostNode {
  id: string;
  slug: string;
  url: string;
  publishedAt?: string;
}

interface HashnodePublishPostPayload {
  publishPost?: {
    post: HashnodePostNode;
  };
}

interface HashnodeUpdatePostPayload {
  updatePost?: {
    post: HashnodePostNode;
  };
}

interface HashnodePostMetricsPayload {
  post?: {
    id: string;
    views?: number;
    reactionCount?: number;
    responseCount?: number;
  };
}

interface HashnodeMePayload {
  me?: {
    id: string;
    username: string;
    name: string;
    profilePicture?: string;
    publications?: {
      edges?: Array<{
        node: {
          id: string;
          title: string;
          url: string;
        };
      }>;
    };
  };
}

interface HashnodeUserPublicationsPayload {
  user?: {
    publications?: {
      edges?: Array<{
        node: {
          id: string;
          title: string;
          url: string;
        };
      }>;
    };
  };
}

/**
 * Hashnode platform adapter.
 * Handles article publishing and updates via Hashnode's GraphQL API (gql.hashnode.com),
 * canonical URL preservation, engagement metrics, and error classification.
 */
export class HashnodeAdapter implements PlatformAdapter {
  readonly provider: PlatformProvider = 'HASHNODE';

  private readonly apiUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: HashnodeAdapterOptions = {}) {
    this.apiUrl = options.apiUrl ?? 'https://gql-beta.hashnode.com';
    this.fetchFn = options.fetchFn ?? globalThis.fetch;
  }

  getCapabilities(): PlatformCapabilities {
    return {
      create: true,
      update: true,
      delete: false,
      analytics: true,
      canonicalUrl: true,
      images: true,
      scheduling: false,
    };
  }

  /**
   * Transforms a canonical ArtXFlow article into a Hashnode projection.
   * Hashnode accepts up to 5 tags.
   */
  async transform(article: CanonicalArticle): Promise<PlatformArticle> {
    const rawTags = article.tags || [];
    const sanitizedTags = rawTags
      .map((tag) =>
        tag
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 30),
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 5);

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
   * Validates article constraints against Hashnode requirements.
   */
  async validate(input: PlatformArticle): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!input.title || !input.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Article title is required and cannot be empty.',
      });
    } else if (input.title.length > 250) {
      errors.push({
        field: 'title',
        message: 'Article title cannot exceed 250 characters on Hashnode.',
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
        message: 'Hashnode allows a maximum of 5 tags.',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Publishes a new article to Hashnode publication.
   */
  async publish(input: PublishInput): Promise<PublishResult> {
    const token = this.extractToken(input.credentials);

    let publicationId =
      (input.destinationConfig?.publicationId as string | undefined) ||
      (input.credentials?.custom?.publicationId as string | undefined) ||
      (input.article.metadata?.publicationId as string | undefined);

    if (!publicationId) {
      try {
        const profile = await this.verifyCredentials(token);
        if (profile.publications?.[0]?.id) {
          publicationId = profile.publications[0].id;
        }
      } catch {
        // Fallback failed
      }
    }

    if (!publicationId) {
      throw new PlatformError({
        provider: this.provider,
        code: 'VALIDATION_ERROR',
        message: 'Hashnode publicationId is required in destination configuration or credentials',
        retryable: false,
      });
    }

    const mutation = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            id
            slug
            url
            publishedAt
          }
        }
      }
    `;

    const tags = (input.article.tags || []).map((tag) => ({
      slug: tag.toLowerCase(),
      name: tag,
    }));

    const variables = {
      input: {
        title: input.article.title,
        subtitle: input.article.description || undefined,
        publicationId,
        contentMarkdown: input.article.content,
        originalArticleURL: input.article.canonicalUrl || undefined,
        tags: tags.length > 0 ? tags : undefined,
        coverImageOptions: input.article.coverImageUrl
          ? { coverImageURL: input.article.coverImageUrl }
          : undefined,
      },
    };

    const response = await this.executeGraphQL<HashnodePublishPostPayload>(
      mutation,
      variables,
      token,
      'publish',
    );

    const post = response.publishPost?.post;
    if (!post) {
      throw new PlatformError({
        provider: this.provider,
        code: 'UNKNOWN_OUTCOME',
        message: 'Hashnode publishPost returned empty post payload',
        retryable: false,
      });
    }

    return {
      externalResourceId: post.id,
      externalUrl: post.url,
      publishedAt: post.publishedAt || new Date().toISOString(),
      metadata: {
        hashnodeId: post.id,
        slug: post.slug,
        publicationId,
      },
    };
  }

  /**
   * Updates an existing Hashnode article.
   */
  async update(input: UpdateInput): Promise<PublishResult> {
    const token = this.extractToken(input.credentials);

    const mutation = `
      mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) {
          post {
            id
            slug
            url
            publishedAt
          }
        }
      }
    `;

    const tags = (input.article.tags || []).map((tag) => ({
      slug: tag.toLowerCase(),
      name: tag,
    }));

    const variables = {
      input: {
        id: input.externalResourceId,
        title: input.article.title,
        subtitle: input.article.description || undefined,
        contentMarkdown: input.article.content,
        originalArticleURL: input.article.canonicalUrl || undefined,
        tags: tags.length > 0 ? tags : undefined,
        coverImageOptions: input.article.coverImageUrl
          ? { coverImageURL: input.article.coverImageUrl }
          : undefined,
      },
    };

    const response = await this.executeGraphQL<HashnodeUpdatePostPayload>(
      mutation,
      variables,
      token,
      'update',
    );

    const post = response.updatePost?.post;
    if (!post) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Hashnode updatePost returned empty post payload for id '${input.externalResourceId}'`,
        retryable: false,
      });
    }

    return {
      externalResourceId: post.id,
      externalUrl: post.url,
      publishedAt: post.publishedAt || new Date().toISOString(),
      metadata: {
        hashnodeId: post.id,
        slug: post.slug,
      },
    };
  }

  /**
   * Deleting articles is not supported via Hashnode public API.
   */
  async delete(_input: DeleteInput): Promise<void> {
    throw new PlatformError({
      provider: this.provider,
      code: 'UNSUPPORTED_OPERATION',
      message: 'Hashnode post deletion is not supported via public API',
      retryable: false,
    });
  }

  /**
   * Fetches engagement metrics for a published article on Hashnode.
   */
  async fetchMetrics(input: MetricsInput): Promise<PlatformMetrics> {
    const token = this.extractToken(input.credentials);

    const query = `
      query PostMetrics($id: ID!) {
        post(id: $id) {
          id
          views
          reactionCount
          responseCount
        }
      }
    `;

    const variables = { id: input.externalResourceId };

    const response = await this.executeGraphQL<HashnodePostMetricsPayload>(
      query,
      variables,
      token,
      'fetchMetrics',
    );

    const post = response.post;
    if (!post) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Hashnode post metrics not found for id '${input.externalResourceId}'`,
        retryable: false,
      });
    }

    return {
      views: post.views,
      reactions: post.reactionCount,
      comments: post.responseCount,
      raw: post as unknown as Record<string, unknown>,
      capturedAt: new Date().toISOString(),
    };
  }

  /**
   * Verifies Hashnode Personal Access Token and retrieves user and publication list.
   */
  async verifyCredentials(token: string): Promise<HashnodeUserProfile> {
    if (!token || !token.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'Hashnode Personal Access Token cannot be empty',
        retryable: false,
      });
    }

    const query = `
      query AuthenticatedUser {
        me {
          id
          username
          name
          profilePicture
          publications(first: 10) {
            edges {
              node {
                id
                title
                url
              }
            }
          }
        }
      }
    `;

    const response = await this.executeGraphQL<HashnodeMePayload>(
      query,
      {},
      token.trim(),
      'verifyCredentials',
    );

    const me = response.me;
    if (!me) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'Hashnode returned empty user profile for token',
        retryable: false,
      });
    }

    let publications: HashnodePublicationSummary[] = (me.publications?.edges || []).map(
      (edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        url: edge.node.url,
      }),
    );

    if (publications.length === 0 && me.username) {
      try {
        const userPubQuery = `
          query GetUserPublications($username: String!) {
            user(username: $username) {
              publications(first: 10) {
                edges {
                  node {
                    id
                    title
                    url
                  }
                }
              }
            }
          }
        `;
        const userPubResponse = await this.executeGraphQL<HashnodeUserPublicationsPayload>(
          userPubQuery,
          { username: me.username },
          token.trim(),
          'getUserPublications',
        );
        publications = (userPubResponse.user?.publications?.edges || []).map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          url: edge.node.url,
        }));
      } catch {
        // Non-blocking fallback
      }
    }

    return {
      externalId: me.id,
      username: me.username,
      displayName: me.name,
      avatarUrl: me.profilePicture || null,
      publications,
    };
  }

  private extractToken(credentials?: PublishInput['credentials']): string {
    const token = credentials?.token || credentials?.apiKey || credentials?.oauth?.accessToken;
    if (!token || !token.trim()) {
      throw new PlatformError({
        provider: this.provider,
        code: 'AUTHENTICATION_ERROR',
        message: 'Hashnode Personal Access Token is required but was not provided',
        retryable: false,
      });
    }
    return token.trim();
  }

  private async executeGraphQL<T>(
    query: string,
    variables: Record<string, unknown>,
    token: string,
    operation: string,
  ): Promise<T> {
    const authHeader = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    let res: Response;
    try {
      res = await this.fetchFn(this.apiUrl, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'ArtXFlow/1.0',
        },
        body: JSON.stringify({ query, variables }),
      });
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
          message: `Request timed out while creating article on Hashnode (${operation}). Remote state is unknown: ${err instanceof Error ? err.message : String(err)}`,
          retryable: false,
          rawError: err,
        });
      }

      if (isTimeout) {
        throw new PlatformError({
          provider: this.provider,
          code: 'TIMEOUT',
          message: `Request timed out while communicating with Hashnode (${operation}): ${err instanceof Error ? err.message : String(err)}`,
          retryable: true,
          rawError: err,
        });
      }

      throw new PlatformError({
        provider: this.provider,
        code: 'NETWORK_ERROR',
        message: `Network failure while communicating with Hashnode (${operation}): ${err instanceof Error ? err.message : String(err)}`,
        retryable: true,
        rawError: err,
      });
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
        message: `Hashnode authentication failed (${res.status}): Invalid or unauthorized token.`,
        statusCode: res.status,
        retryable: false,
        rawError: responseBody,
      });
    }

    if (res.status === 429) {
      throw new PlatformError({
        provider: this.provider,
        code: 'RATE_LIMITED',
        message: 'Hashnode rate limit reached. Retry scheduled.',
        statusCode: 429,
        retryable: true,
        rawError: responseBody,
      });
    }

    if (res.status >= 500) {
      throw new PlatformError({
        provider: this.provider,
        code: 'PROVIDER_5XX',
        message: `Hashnode internal server error (${res.status}): ${responseBody}`,
        statusCode: res.status,
        retryable: true,
        rawError: responseBody,
      });
    }

    let json: GraphQLResponse<T>;
    try {
      json = JSON.parse(responseBody);
    } catch {
      throw new PlatformError({
        provider: this.provider,
        code: 'PROVIDER_5XX',
        message: `Hashnode returned non-JSON response (${res.status}): ${responseBody.slice(0, 300)}`,
        statusCode: res.status >= 400 ? res.status : 502,
        retryable: true,
        rawError: responseBody,
      });
    }

    if (json.errors && json.errors.length > 0) {
      const firstError = json.errors[0];
      const errorMessage = firstError.message;
      const code = firstError.extensions?.code?.toUpperCase() || '';

      if (
        code === 'UNAUTHENTICATED' ||
        /unauthorized|unauthenticated|invalid token|access token|must be logged in/i.test(
          errorMessage,
        )
      ) {
        throw new PlatformError({
          provider: this.provider,
          code: 'AUTHENTICATION_ERROR',
          message: `Hashnode GraphQL authentication error: ${errorMessage}`,
          statusCode: 401,
          retryable: false,
          rawError: json.errors,
        });
      }

      if (code === 'FORBIDDEN' || /forbidden|permission denied/i.test(errorMessage)) {
        throw new PlatformError({
          provider: this.provider,
          code: 'AUTHORIZATION_ERROR',
          message: `Hashnode GraphQL authorization error: ${errorMessage}`,
          statusCode: 403,
          retryable: false,
          rawError: json.errors,
        });
      }

      if (code === 'NOT_FOUND' || /not found/i.test(errorMessage)) {
        throw new PlatformError({
          provider: this.provider,
          code: 'NOT_FOUND',
          message: `Hashnode resource not found: ${errorMessage}`,
          statusCode: 404,
          retryable: false,
          rawError: json.errors,
        });
      }

      if (/rate limit/i.test(errorMessage)) {
        throw new PlatformError({
          provider: this.provider,
          code: 'RATE_LIMITED',
          message: `Hashnode rate limit exceeded: ${errorMessage}`,
          statusCode: 429,
          retryable: true,
          rawError: json.errors,
        });
      }

      if (
        code === 'BAD_USER_INPUT' ||
        code === 'GRAPHQL_VALIDATION_FAILED' ||
        /validation|cannot be blank|required/i.test(errorMessage)
      ) {
        throw new PlatformError({
          provider: this.provider,
          code: 'VALIDATION_ERROR',
          message: `Hashnode GraphQL validation error: ${errorMessage}`,
          statusCode: 400,
          retryable: false,
          rawError: json.errors,
        });
      }

      throw new PlatformError({
        provider: this.provider,
        code: 'UNKNOWN_OUTCOME',
        message: `Hashnode GraphQL error: ${errorMessage}`,
        retryable: false,
        rawError: json.errors,
      });
    }

    if (!json.data) {
      throw new PlatformError({
        provider: this.provider,
        code: 'PROVIDER_5XX',
        message: 'Hashnode GraphQL response returned neither data nor errors',
        retryable: true,
        rawError: responseBody,
      });
    }

    return json.data;
  }
}

export const hashnodeAdapter = new HashnodeAdapter();
