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
import { isClientManagedDestination } from '../utils/medium-publish-mode';

export interface PublishArticleInput {
  articleId: string;
  destinationIds?: string[];
  articleVersionId?: string;
  destinationOverrides?: Record<string, DestinationOverrides>;
  idempotencyKey?: string;
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
    const workerDestinations: Destination[] = [];

    for (const dest of targetDestinations) {
      const overrides = input.destinationOverrides?.[dest.id] as
        Record<string, unknown> | undefined;
      const clientManaged = isClientManagedDestination({
        type: dest.type,
        config: (dest.config as Record<string, unknown>) || {},
      });
      const nextStatus = clientManaged ? 'PENDING' : 'QUEUED';

      let pub = await this.publicationRepo.findByVersionAndDestination(
        ctx.organizationId,
        version.id,
        dest.id,
      );

      if (pub) {
        if (pub.status !== 'PUBLISHED') {
          pub = await this.publicationRepo.updateStatus(pub.id, ctx.organizationId, {
            status: nextStatus,
            ...(overrides ? { overrides } : {}),
          });
          await this.publicationEventRepo.create({
            publicationId: pub.id,
            eventType: clientManaged ? 'CREATED' : 'QUEUED',
            correlationId,
            metadata: {
              articleId: article.id,
              articleVersionId: version.id,
              destinationId: dest.id,
              destinationType: dest.type,
              reason: clientManaged
                ? 'Client-managed publish pending'
                : 'Republish queued',
            },
          });
        }
      } else {
        pub = await this.publicationRepo.create({
          organizationId: ctx.organizationId,
          articleId: article.id,
          articleVersionId: version.id,
          destinationId: dest.id,
          status: nextStatus,
          overrides: overrides || {},
        });

        await this.publicationEventRepo.create({
          publicationId: pub.id,
          eventType: clientManaged ? 'CREATED' : 'QUEUED',
          correlationId,
          metadata: {
            articleId: article.id,
            articleVersionId: version.id,
            destinationId: dest.id,
            destinationType: dest.type,
            clientManagedPublishMode: clientManaged
              ? ((dest.config as Record<string, unknown>)?.hashnodePublishMode ??
                (dest.config as Record<string, unknown>)?.mediumPublishMode ??
                null)
              : undefined,
          },
        });
      }

      publications.push(pub);
      if (!clientManaged) {
        workerDestinations.push(dest);
      }
    }

    const workerPublications = publications.filter((pub) =>
      workerDestinations.some((dest) => dest.id === pub.destinationId),
    );

    // 6. Create workflow job record & 7. Enqueue distribution workflow asynchronously
    // Client-managed Hashnode/Medium modes (extension / web editor / manual URL) are
    // completed in the browser and must not be sent to the platform API worker.
    if (workerPublications.length === 0) {
      return {
        articleId: article.id,
        articleVersionId: version.id,
        publications: publications.map(toPublicationDto),
      };
    }

    const workerPayload = {
      distributionId: version.id,
      articleId: article.id,
      articleVersionId: version.id,
      publicationIds: workerPublications.map((p) => p.id),
      destinationIds: workerDestinations.map((d) => d.id),
    };

    const baseKey = input.idempotencyKey || `${ctx.organizationId}:${version.id}:distribute`;
    let enqueueResult = await this.jobQueue.enqueue({
      type: 'DISTRIBUTE_ARTICLE',
      organizationId: ctx.organizationId,
      referenceType: 'ARTICLE_VERSION',
      referenceId: version.id,
      idempotencyKey: baseKey,
      correlationId,
      payload: workerPayload,
    });

    // If an earlier distribution run for this article version was already recorded in workflow_jobs,
    // re-enqueue with a correlation-scoped run key so this subsequent publish or retry attempt
    // generates a fresh durable workflow job and is dispatched to background workers.
    if (enqueueResult.status === 'ALREADY_EXISTS' && !input.idempotencyKey) {
      const runKey = `${baseKey}:${correlationId}`;
      enqueueResult = await this.jobQueue.enqueue({
        type: 'DISTRIBUTE_ARTICLE',
        organizationId: ctx.organizationId,
        referenceType: 'ARTICLE_VERSION',
        referenceId: version.id,
        idempotencyKey: runKey,
        correlationId,
        payload: workerPayload,
      });
    }

    return {
      articleId: article.id,
      articleVersionId: version.id,
      publications: publications.map(toPublicationDto),
      jobId: enqueueResult.jobId,
    };
  }
}

export const publishArticleService = new PublishArticleService();
