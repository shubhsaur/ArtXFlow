import {
  destinationRepository,
  publicationRepository,
  publicationEventRepository,
  articleRepository,
  articleVersionRepository,
  siteRepository,
  organizationRepository,
  type DestinationRepository,
  type PublicationRepository,
  type PublicationEventRepository,
  type ArticleRepository,
  type ArticleVersionRepository,
  type SiteRepository,
  type OrganizationRepository,
  type Destination,
  type Publication,
} from '@artxflow/database';
import { toPublicationDto, type PublicationDto } from '../models';
import {
  UnauthorizedTenantAccessError,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
  PublishingError,
} from '../errors';
import type { DestinationOverrides } from '@artxflow/types';
import type { JobQueue } from '../queue/job-queue';
import { WorkflowJobQueue } from '../queue/workflow-job-queue';
import type { CommandContext } from './publication.service';

export interface PublishArticleInput {
  articleId: string;
  destinationIds?: string[];
  articleVersionId?: string;
  destinationOverrides?: Record<string, DestinationOverrides>;
}

export interface PublishArticleResult {
  articleId: string;
  articleVersionId: string;
  publications: PublicationDto[];
  jobId?: string;
}

export interface PublishArticleServiceOptions {
  articleRepo?: ArticleRepository;
  articleVersionRepo?: ArticleVersionRepository;
  destinationRepo?: DestinationRepository;
  publicationRepo?: PublicationRepository;
  publicationEventRepo?: PublicationEventRepository;
  siteRepo?: SiteRepository;
  orgRepo?: OrganizationRepository;
  jobQueue?: JobQueue;
}

/**
 * Application service orchestrating end-to-end article publication:
 * 1. Authorize organization access
 * 2. Validate article state
 * 3. Resolve version
 * 4. Validate destination(s)
 * 5. Create/queue publication records & audit events
 * 6. Create workflow job record with idempotency guarantee
 * 7. Enqueue distribution workflow asynchronously
 */
export class PublishArticleService {
  private readonly articleRepo: ArticleRepository;
  private readonly articleVersionRepo: ArticleVersionRepository;
  private readonly destinationRepo: DestinationRepository;
  private readonly publicationRepo: PublicationRepository;
  private readonly publicationEventRepo: PublicationEventRepository;
  private readonly siteRepo: SiteRepository;
  private readonly orgRepo: OrganizationRepository;
  private readonly jobQueue: JobQueue;

  constructor(options: PublishArticleServiceOptions = {}) {
    this.articleRepo = options.articleRepo ?? articleRepository;
    this.articleVersionRepo = options.articleVersionRepo ?? articleVersionRepository;
    this.destinationRepo = options.destinationRepo ?? destinationRepository;
    this.publicationRepo = options.publicationRepo ?? publicationRepository;
    this.publicationEventRepo = options.publicationEventRepo ?? publicationEventRepository;
    this.siteRepo = options.siteRepo ?? siteRepository;
    this.orgRepo = options.orgRepo ?? organizationRepository;
    this.jobQueue = options.jobQueue ?? new WorkflowJobQueue();
  }

  async publishArticle(
    ctx: CommandContext,
    input: PublishArticleInput,
  ): Promise<PublishArticleResult> {
    const correlationId = ctx.correlationId || crypto.randomUUID();

    // 1. Authorize organization access
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    // 2. Validate article state
    const article = await this.articleRepo.findArticleForOrganization(
      ctx.organizationId,
      input.articleId,
    );
    if (!article) {
      throw new ArticleNotFoundError(input.articleId, ctx.organizationId);
    }

    if (article.status === 'ARCHIVED') {
      throw new ArticleNotPublishableError(
        `Cannot publish archived article '${input.articleId}'. Restore it to draft first.`,
      );
    }

    // 3. Resolve article version
    let version = null;
    if (input.articleVersionId) {
      version = await this.articleVersionRepo.findForArticle(article.id, input.articleVersionId);
    } else {
      version = await this.articleVersionRepo.getLatestVersion(article.id);
    }

    if (!version) {
      throw new PublishingError(
        `No version snapshot found for article '${input.articleId}' to publish.`,
      );
    }

    if (!version.content || !version.content.trim()) {
      throw new ArticleNotPublishableError(
        `Article version content is empty. Cannot publish empty article.`,
      );
    }

    // 4. Validate destination(s)
    let targetDestinations: Destination[] = [];

    if (input.destinationIds && input.destinationIds.length > 0) {
      for (const destId of input.destinationIds) {
        const dest = await this.destinationRepo.findForOrganization(ctx.organizationId, destId);
        if (dest && dest.status === 'ACTIVE') {
          targetDestinations.push(dest);
        }
      }
    } else {
      // Auto-resolve active destinations for the organization
      const orgDestinations = await this.destinationRepo.listByOrganization(ctx.organizationId);
      targetDestinations = orgDestinations.filter((d) => d.status === 'ACTIVE');

      // If no destinations exist yet, check for an active site and auto-provision the ArtXFlow Blog destination
      if (targetDestinations.length === 0) {
        const sites = await this.siteRepo.listByOrganization(ctx.organizationId);
        const activeSite = sites.find((s) => s.status === 'ACTIVE') || sites[0];

        if (activeSite) {
          const autoDest = await this.destinationRepo.create({
            organizationId: ctx.organizationId,
            type: 'ARTXFLOW_BLOG',
            name: `${activeSite.name} (Blog)`,
            siteId: activeSite.id,
            config: {
              siteId: activeSite.id,
              subdomain: activeSite.subdomain,
            },
            status: 'ACTIVE',
          });
          targetDestinations.push(autoDest);
        }
      }
    }

    if (targetDestinations.length === 0) {
      throw new InvalidDestinationConfigurationError(
        'No active publishing destinations configured for this organization.',
      );
    }

    // 5. Create or update publication records & log audit events
    const publications: Publication[] = [];

    for (const dest of targetDestinations) {
      const overrides = input.destinationOverrides?.[dest.id] as
        Record<string, unknown> | undefined;

      let pub = await this.publicationRepo.findByVersionAndDestination(
        ctx.organizationId,
        version.id,
        dest.id,
      );

      if (pub) {
        if (pub.status !== 'PUBLISHED') {
          pub = await this.publicationRepo.updateStatus(pub.id, ctx.organizationId, {
            status: 'QUEUED',
            ...(overrides ? { overrides } : {}),
          });
          await this.publicationEventRepo.create({
            publicationId: pub.id,
            eventType: 'QUEUED',
            correlationId,
            metadata: {
              articleId: article.id,
              articleVersionId: version.id,
              destinationId: dest.id,
              destinationType: dest.type,
              reason: 'Republish queued',
            },
          });
        }
      } else {
        pub = await this.publicationRepo.create({
          organizationId: ctx.organizationId,
          articleId: article.id,
          articleVersionId: version.id,
          destinationId: dest.id,
          status: 'QUEUED',
          overrides: overrides || {},
        });

        await this.publicationEventRepo.create({
          publicationId: pub.id,
          eventType: 'QUEUED',
          correlationId,
          metadata: {
            articleId: article.id,
            articleVersionId: version.id,
            destinationId: dest.id,
            destinationType: dest.type,
          },
        });
      }

      publications.push(pub);
    }

    // 6. Create workflow job record & 7. Enqueue distribution workflow asynchronously
    const idempotencyKey = `${ctx.organizationId}:${version.id}:distribute`;
    const enqueueResult = await this.jobQueue.enqueue({
      type: 'DISTRIBUTE_ARTICLE',
      organizationId: ctx.organizationId,
      referenceType: 'ARTICLE_VERSION',
      referenceId: version.id,
      idempotencyKey,
      correlationId,
      payload: {
        distributionId: version.id,
        articleId: article.id,
        articleVersionId: version.id,
        publicationIds: publications.map((p) => p.id),
        destinationIds: targetDestinations.map((d) => d.id),
      },
    });

    return {
      articleId: article.id,
      articleVersionId: version.id,
      publications: publications.map(toPublicationDto),
      jobId: enqueueResult.jobId,
    };
  }
}

export const publishArticleService = new PublishArticleService();
