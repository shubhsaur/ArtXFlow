import {
  SiteRepository,
  ArticleRepository,
  ArticleVersionRepository,
  type Site,
  type Article,
  type ArticleVersion,
} from '@artxflow/database';

export interface PublicArticleResult {
  site: Site;
  article: Article;
  version: ArticleVersion;
}

export interface PublicSiteArticlesResult {
  site: Site;
  articles: Article[];
}

export class PublicSiteService {
  constructor(
    private readonly siteRepo: SiteRepository = new SiteRepository(),
    private readonly articleRepo: ArticleRepository = new ArticleRepository(),
    private readonly versionRepo: ArticleVersionRepository = new ArticleVersionRepository(),
  ) {}

  /**
   * Resolves an active public site by its unique subdomain.
   * Returns null if the site does not exist or is not in ACTIVE status.
   */
  async resolvePublicSite(subdomain: string): Promise<Site | null> {
    if (!subdomain || !subdomain.trim()) {
      return null;
    }

    const site = await this.siteRepo.findBySubdomain(subdomain.trim().toLowerCase());
    if (!site || site.status !== 'ACTIVE') {
      return null;
    }

    return site;
  }

  /**
   * Resolves a published article by site subdomain and article slug.
   * Enforces that:
   * 1. The site exists and is ACTIVE.
   * 2. The article belongs to the site's organization.
   * 3. The article is in READY (published) status. DRAFT or ARCHIVED articles return null.
   * 4. The latest immutable version snapshot is retrieved.
   */
  async getPublicArticle(subdomain: string, slug: string): Promise<PublicArticleResult | null> {
    const site = await this.resolvePublicSite(subdomain);
    if (!site) {
      return null;
    }

    const cleanSlug = slug.trim().toLowerCase();
    const article = await this.articleRepo.findPublishedBySlug(site.organizationId, cleanSlug);
    if (!article) {
      return null;
    }

    const version = await this.versionRepo.getLatestVersion(article.id);
    if (!version) {
      return null;
    }

    return {
      site,
      article,
      version,
    };
  }

  /**
   * Lists all published articles for a public site.
   * Returns null if the site is not found or not active.
   */
  async listPublicArticles(subdomain: string): Promise<PublicSiteArticlesResult | null> {
    const site = await this.resolvePublicSite(subdomain);
    if (!site) {
      return null;
    }

    const articles = await this.articleRepo.listPublishedByOrganization(site.organizationId);

    return {
      site,
      articles,
    };
  }
}
