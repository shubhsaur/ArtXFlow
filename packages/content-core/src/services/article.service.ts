import {
  type ArticleRepository,
  type ArticleVersionRepository,
  type OrganizationRepository,
  articleRepository as defaultArticleRepo,
  articleVersionRepository as defaultArticleVersionRepo,
  organizationRepository as defaultOrgRepo,
  type Article,
  type ArticleVersion,
  type ArticleStatus,
} from '@artxflow/database';
import {
  UnauthorizedOrganizationAccessError,
  ArticleNotFoundError,
  DuplicateSlugError,
  ValidationError,
} from '../errors';

export interface CommandContext {
  userId: string;
  organizationId: string;
  correlationId?: string;
}

export interface CreateArticleInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  contentFormat?: string;
  coverAssetId?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateArticleResult {
  article: Article;
  version: ArticleVersion;
}

export interface UpdateArticleInput {
  articleId: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  status?: ArticleStatus;
  coverAssetId?: string | null;
  content?: string;
  contentFormat?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateArticleResult {
  article: Article;
  version: ArticleVersion;
  versionIncremented: boolean;
}

export interface GetArticleInput {
  articleId?: string;
  slug?: string;
  versionNumber?: number;
}

export interface GetArticleResult {
  article: Article;
  version: ArticleVersion | null;
  versionsCount: number;
}

export function generateArticleSlug(title: string): string {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'untitled-article';
}

export class ArticleService {
  constructor(
    private readonly articleRepo: ArticleRepository = defaultArticleRepo,
    private readonly versionRepo: ArticleVersionRepository = defaultArticleVersionRepo,
    private readonly orgRepo: OrganizationRepository = defaultOrgRepo,
  ) {}

  private async authorize(context: CommandContext): Promise<void> {
    const access = await this.orgRepo.getOrganizationForUser(
      context.organizationId,
      context.userId,
    );

    if (!access) {
      throw new UnauthorizedOrganizationAccessError(context.organizationId, context.userId);
    }
  }

  /**
   * Create an article and its initial immutable version (version 1) transactionally.
   */
  async createArticle(
    context: CommandContext,
    input: CreateArticleInput,
  ): Promise<CreateArticleResult> {
    await this.authorize(context);

    if (!input.title || !input.title.trim()) {
      throw new ValidationError('Article title is required and cannot be empty.');
    }

    if (input.content === undefined || input.content === null) {
      throw new ValidationError('Article content is required.');
    }

    const candidateSlug = input.slug
      ? generateArticleSlug(input.slug)
      : generateArticleSlug(input.title);

    // Check slug uniqueness within this organization
    const existingWithSlug = await this.articleRepo.findBySlug(
      context.organizationId,
      candidateSlug,
    );

    if (existingWithSlug) {
      throw new DuplicateSlugError(candidateSlug, context.organizationId);
    }

    const result = await this.articleRepo.createWithInitialVersion({
      article: {
        organizationId: context.organizationId,
        authorId: context.userId,
        title: input.title.trim(),
        slug: candidateSlug,
        excerpt: input.excerpt?.trim() || null,
        status: 'DRAFT',
        coverAssetId: input.coverAssetId || null,
      },
      content: input.content,
      contentFormat: input.contentFormat || 'markdown',
      metadata: input.metadata || {},
      authorId: context.userId,
    });

    return result;
  }

  /**
   * Updates article metadata. If content changes, appends a new immutable version.
   * Historical versions are never mutated.
   */
  async updateArticle(
    context: CommandContext,
    input: UpdateArticleInput,
  ): Promise<UpdateArticleResult> {
    await this.authorize(context);

    const article = await this.articleRepo.findById(input.articleId);
    if (!article || article.organizationId !== context.organizationId) {
      throw new ArticleNotFoundError(input.articleId, context.organizationId);
    }

    // If slug is being updated, verify uniqueness within the tenant
    let targetSlug = article.slug;
    if (input.slug && input.slug !== article.slug) {
      targetSlug = generateArticleSlug(input.slug);
      const existingWithSlug = await this.articleRepo.findBySlug(
        context.organizationId,
        targetSlug,
      );
      if (existingWithSlug && existingWithSlug.id !== article.id) {
        throw new DuplicateSlugError(targetSlug, context.organizationId);
      }
    }

    // Retrieve latest version to check for content modification
    const latestVersion = await this.versionRepo.getLatestVersion(article.id);
    if (!latestVersion) {
      throw new Error(`Integrity error: No versions found for article '${article.id}'`);
    }

    const contentChanged = input.content !== undefined && input.content !== latestVersion.content;
    const metadataChanged =
      input.metadata !== undefined &&
      JSON.stringify(input.metadata) !== JSON.stringify(latestVersion.metadata);

    let activeVersion = latestVersion;
    let versionIncremented = false;

    // If canonical content or metadata changed, append an immutable snapshot
    if (contentChanged || metadataChanged) {
      const nextVersionNumber = latestVersion.versionNumber + 1;
      activeVersion = await this.versionRepo.create({
        articleId: article.id,
        versionNumber: nextVersionNumber,
        content: input.content !== undefined ? input.content : latestVersion.content,
        contentFormat: input.contentFormat || latestVersion.contentFormat,
        metadata: input.metadata || latestVersion.metadata,
        createdBy: context.userId,
      });
      versionIncremented = true;
    }

    // Update article top-level attributes
    const updatedArticle = await this.articleRepo.update(article.id, {
      title: input.title !== undefined ? input.title.trim() : article.title,
      slug: targetSlug,
      excerpt: input.excerpt !== undefined ? input.excerpt?.trim() || null : article.excerpt,
      status: input.status !== undefined ? input.status : article.status,
      coverAssetId: input.coverAssetId !== undefined ? input.coverAssetId : article.coverAssetId,
    });

    if (!updatedArticle) {
      throw new ArticleNotFoundError(article.id, context.organizationId);
    }

    return {
      article: updatedArticle,
      version: activeVersion,
      versionIncremented,
    };
  }

  /**
   * Retrieves an article and its version (defaults to latest if versionNumber is omitted).
   */
  async getArticle(context: CommandContext, input: GetArticleInput): Promise<GetArticleResult> {
    await this.authorize(context);

    let article: Article | null = null;
    if (input.articleId) {
      article = await this.articleRepo.findById(input.articleId);
    } else if (input.slug) {
      article = await this.articleRepo.findBySlug(context.organizationId, input.slug);
    } else {
      throw new ValidationError('Must provide either articleId or slug to getArticle.');
    }

    if (!article || article.organizationId !== context.organizationId) {
      throw new ArticleNotFoundError(
        input.articleId || input.slug || 'unknown',
        context.organizationId,
      );
    }

    const versions = await this.versionRepo.listByArticle(article.id);
    let targetVersion: ArticleVersion | null = null;

    if (input.versionNumber !== undefined) {
      targetVersion = versions.find((v) => v.versionNumber === input.versionNumber) || null;
    } else {
      targetVersion = versions[0] || null; // listByArticle is ordered desc
    }

    return {
      article,
      version: targetVersion,
      versionsCount: versions.length,
    };
  }
}

export const articleService = new ArticleService();
