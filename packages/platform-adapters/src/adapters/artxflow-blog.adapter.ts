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
import {
  type ArticleRepository,
  type SiteRepository,
  type ArticleVersionRepository,
  articleRepository as defaultArticleRepo,
  siteRepository as defaultSiteRepo,
  articleVersionRepository as defaultVersionRepo,
} from '@artxflow/database';

export interface ArtXFlowBlogAdapterOptions {
  articleRepo?: ArticleRepository;
  siteRepo?: SiteRepository;
  versionRepo?: ArticleVersionRepository;
  baseUrl?: string;
}

/**
 * First-party platform adapter for ArtXFlow hosted blog destinations.
 * Reuses internal domain repositories and services directly without artificial HTTP overhead.
 */
export class ArtXFlowBlogAdapter implements PlatformAdapter {
  readonly provider: PlatformProvider = 'ARTXFLOW_BLOG';

  private readonly articleRepo: ArticleRepository;
  private readonly siteRepo: SiteRepository;
  private readonly versionRepo: ArticleVersionRepository;
  private readonly baseUrl?: string;

  constructor(options: ArtXFlowBlogAdapterOptions = {}) {
    this.articleRepo = options.articleRepo ?? defaultArticleRepo;
    this.siteRepo = options.siteRepo ?? defaultSiteRepo;
    this.versionRepo = options.versionRepo ?? defaultVersionRepo;
    this.baseUrl = options.baseUrl;
  }

  getCapabilities(): PlatformCapabilities {
    return {
      create: true,
      update: true,
      delete: true,
      analytics: true,
      canonicalUrl: true,
      images: true,
      scheduling: true,
    };
  }

  async validate(input: PlatformArticle): Promise<ValidationResult> {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!input.title || !input.title.trim()) {
      errors.push({
        field: 'title',
        message: 'Article title is required and cannot be empty.',
      });
    }

    if (
      input.content === undefined ||
      input.content === null ||
      typeof input.content !== 'string'
    ) {
      errors.push({
        field: 'content',
        message: 'Article content is required.',
      });
    }

    if (!input.metadata?.articleId) {
      errors.push({
        field: 'metadata.articleId',
        message: 'Platform article must contain canonical articleId in metadata.',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async transform(article: CanonicalArticle): Promise<PlatformArticle> {
    return {
      title: article.title,
      content: article.markdown,
      description: article.excerpt ?? undefined,
      tags: article.tags,
      canonicalUrl: article.canonicalUrl ?? undefined,
      coverImageUrl: article.coverImage?.url ?? undefined,
      metadata: {
        ...article.metadata,
        articleId: article.id,
        versionId: article.versionId,
      },
    };
  }

  async publish(input: PublishInput): Promise<PublishResult> {
    const articleId =
      (input.article.metadata?.articleId as string) ||
      (input.destinationConfig?.articleId as string);

    if (!articleId) {
      throw new PlatformError({
        provider: this.provider,
        code: 'VALIDATION_ERROR',
        message: 'Cannot publish to ArtXFlow Blog: articleId is missing.',
        retryable: false,
      });
    }

    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Article '${articleId}' not found`,
        retryable: false,
      });
    }

    // Resolve target site: from siteId, subdomain, or organization
    let site = null;
    const targetSiteId = input.destinationConfig?.siteId as string | undefined;
    const targetSubdomain = input.destinationConfig?.subdomain as string | undefined;

    if (targetSiteId) {
      site = await this.siteRepo.findById(targetSiteId);
    } else if (targetSubdomain) {
      site = await this.siteRepo.findBySubdomain(targetSubdomain);
    } else {
      const orgSites = await this.siteRepo.listByOrganization(article.organizationId);
      site = orgSites.find((s) => s.status === 'ACTIVE') || orgSites[0] || null;
    }

    if (!site) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Public site not found for publication destination on article '${articleId}'`,
        retryable: false,
      });
    }

    // Ensure article status is 'READY' so it becomes visible on the public site
    if (article.status !== 'READY') {
      await this.articleRepo.update(article.id, {
        status: 'READY',
      });
    }

    // Construct external URL
    const externalUrl = this.buildPublicUrl(site, article.slug);

    return {
      externalResourceId: article.id,
      externalUrl,
      publishedAt: new Date().toISOString(),
      metadata: {
        siteId: site.id,
        subdomain: site.subdomain,
        slug: article.slug,
        articleVersionId: input.article.metadata?.versionId,
      },
    };
  }

  async update(input: UpdateInput): Promise<PublishResult> {
    const articleId = input.externalResourceId || (input.article.metadata?.articleId as string);

    if (!articleId) {
      throw new PlatformError({
        provider: this.provider,
        code: 'VALIDATION_ERROR',
        message: 'Cannot update ArtXFlow Blog publication: articleId is missing.',
        retryable: false,
      });
    }

    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Article '${articleId}' not found`,
        retryable: false,
      });
    }

    // Resolve target site
    let site = null;
    const targetSiteId = input.destinationConfig?.siteId as string | undefined;
    const targetSubdomain = input.destinationConfig?.subdomain as string | undefined;

    if (targetSiteId) {
      site = await this.siteRepo.findById(targetSiteId);
    } else if (targetSubdomain) {
      site = await this.siteRepo.findBySubdomain(targetSubdomain);
    } else {
      const orgSites = await this.siteRepo.listByOrganization(article.organizationId);
      site = orgSites.find((s) => s.status === 'ACTIVE') || orgSites[0] || null;
    }

    if (!site) {
      throw new PlatformError({
        provider: this.provider,
        code: 'NOT_FOUND',
        message: `Public site not found for publication destination on article '${articleId}'`,
        retryable: false,
      });
    }

    // Ensure status is READY and update top-level fields if provided
    const updateData: {
      status: 'READY';
      title?: string;
      excerpt?: string | null;
    } = {
      status: 'READY',
    };
    if (input.article.title && input.article.title !== article.title) {
      updateData.title = input.article.title;
    }
    if (input.article.description !== undefined) {
      updateData.excerpt = input.article.description;
    }

    const updated = await this.articleRepo.update(article.id, updateData);
    const targetSlug = updated?.slug || article.slug;
    const externalUrl = this.buildPublicUrl(site, targetSlug);

    return {
      externalResourceId: article.id,
      externalUrl,
      publishedAt: new Date().toISOString(),
      metadata: {
        siteId: site.id,
        subdomain: site.subdomain,
        slug: targetSlug,
        articleVersionId: input.article.metadata?.versionId,
      },
    };
  }

  async delete(input: DeleteInput): Promise<void> {
    const articleId = input.externalResourceId;
    if (!articleId) {
      return;
    }

    const article = await this.articleRepo.findById(articleId);
    if (!article) {
      return;
    }

    // Unpublish article by setting status back to 'DRAFT'
    await this.articleRepo.update(article.id, {
      status: 'DRAFT',
    });
  }

  async fetchMetrics(_input: MetricsInput): Promise<PlatformMetrics> {
    return {
      views: 0,
      reads: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      capturedAt: new Date().toISOString(),
    };
  }

  private buildPublicUrl(
    site: { subdomain: string; customDomain?: string | null },
    slug: string,
  ): string {
    if (site.customDomain) {
      return `https://${site.customDomain}/${slug}`;
    }
    const cleanSubdomain = site.subdomain.toLowerCase().trim();
    if (this.baseUrl) {
      const base = this.baseUrl.replace(/\/+$/, '');
      return `${base}/sites/${cleanSubdomain}/${slug}`;
    }
    return `/sites/${cleanSubdomain}/${slug}`;
  }
}

export const artxflowBlogAdapter = new ArtXFlowBlogAdapter();
