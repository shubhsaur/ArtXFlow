import {
  destinationRepository,
  publicationRepository,
  publicationEventRepository,
  siteRepository,
  articleRepository,
  articleVersionRepository,
  platformConnectionRepository,
  type DestinationRepository,
  type PublicationRepository,
  type PublicationEventRepository,
  type SiteRepository,
  type ArticleRepository,
  type ArticleVersionRepository,
  type PlatformConnectionRepository,
} from '@artxflow/database';
import type {
  PublicationStatus,
  DistributionStatus,
  DestinationType,
  DestinationStatus,
} from '@artxflow/types';
import {
  toDestinationDto,
  toPublicationDto,
  toPublicationEventDto,
  type DestinationDto,
  type PublicationDto,
  type PublicationEventDto,
} from '../models';
import {
  DestinationNotFoundError,
  PublicationNotFoundError,
  DuplicatePublicationError,
  InvalidDestinationConfigurationError,
  InvalidPublicationStateError,
  PublishingError,
} from '../errors';
import type { JobQueue } from '../queue/job-queue';
import { WorkflowJobQueue } from '../queue/workflow-job-queue';
import { calculateDistributionStatus } from '../utils/distribution-status';

export interface CommandContext {
  userId: string;
  organizationId: string;
  correlationId?: string;
}

export interface CreateDestinationInput {
  type: DestinationType;
  name: string;
  siteId?: string | null;
  connectionId?: string | null;
  config?: Record<string, unknown>;
  status?: DestinationStatus;
}

export interface UpdateDestinationInput {
  name?: string;
  config?: Record<string, unknown>;
  status?: DestinationStatus;
}

export interface CreatePublicationInput {
  articleId: string;
  articleVersionId: string;
  destinationId: string;
  initialStatus?: PublicationStatus;
  overrides?: Record<string, unknown>;
}

export interface UpdatePublicationStatusInput {
  publicationId: string;
  status: PublicationStatus;
  externalResourceId?: string | null;
  externalUrl?: string | null;
  publishedAt?: Date | null;
  lastAttemptAt?: Date | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  overrides?: Record<string, unknown>;
}

export class PublicationService {
  constructor(
    private readonly destinationRepo: DestinationRepository = destinationRepository,
    private readonly publicationRepo: PublicationRepository = publicationRepository,
    private readonly publicationEventRepo: PublicationEventRepository = publicationEventRepository,
    private readonly siteRepo: SiteRepository = siteRepository,
    private readonly articleRepo: ArticleRepository = articleRepository,
    private readonly articleVersionRepo: ArticleVersionRepository = articleVersionRepository,
    private readonly connectionRepo: PlatformConnectionRepository = platformConnectionRepository,
    private readonly jobQueue: JobQueue = new WorkflowJobQueue(),
  ) {}

  /**
   * Creates a new destination, ensuring any referenced site belongs to the tenant.
   */
  async createDestination(
    ctx: CommandContext,
    input: CreateDestinationInput,
  ): Promise<DestinationDto> {
    if (!input.name || input.name.trim().length === 0) {
      throw new InvalidDestinationConfigurationError('Destination name is required');
    }

    if (!input.type || input.type.trim().length === 0) {
      throw new InvalidDestinationConfigurationError('Destination type is required');
    }

    // Verify referenced site belongs to the same organization
    if (input.siteId) {
      const site = await this.siteRepo.findSiteForOrganization(ctx.organizationId, input.siteId);
      if (!site) {
        throw new InvalidDestinationConfigurationError(
          `Referenced site '${input.siteId}' not found in organization '${ctx.organizationId}'`,
        );
      }
    }

    // Verify referenced platform connection belongs to the same organization
    if (input.connectionId) {
      const conn = await this.connectionRepo.findForOrganization(
        ctx.organizationId,
        input.connectionId,
      );
      if (!conn) {
        throw new InvalidDestinationConfigurationError(
          `Referenced platform connection '${input.connectionId}' not found in organization '${ctx.organizationId}'`,
        );
      }
    }

    const created = await this.destinationRepo.create({
      organizationId: ctx.organizationId,
      type: input.type,
      name: input.name.trim(),
      siteId: input.siteId || null,
      connectionId: input.connectionId || null,
      config: input.config || {},
      status: input.status || 'ACTIVE',
    });

    return toDestinationDto(created);
  }

  /**
   * Updates destination attributes within tenant boundaries.
   * Config is shallow-merged so unrelated destination keys are preserved.
   */
  async updateDestination(
    ctx: CommandContext,
    destinationId: string,
    input: UpdateDestinationInput,
  ): Promise<DestinationDto> {
    const existing = await this.getDestination(ctx, destinationId);

    const updated = await this.destinationRepo.update(destinationId, ctx.organizationId, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.config !== undefined ? { config: { ...existing.config, ...input.config } } : {}),
    });

    return toDestinationDto(updated);
  }

  /**
   * Retrieves a destination within tenant boundaries.
   */
  async getDestination(ctx: CommandContext, destinationId: string): Promise<DestinationDto> {
    const destination = await this.destinationRepo.findForOrganization(
      ctx.organizationId,
      destinationId,
    );

    if (!destination) {
      throw new DestinationNotFoundError(destinationId, ctx.organizationId);
    }

    return toDestinationDto(destination);
  }

  /**
   * Lists all destinations for the tenant organization.
   */
  async listDestinations(ctx: CommandContext): Promise<DestinationDto[]> {
    const list = await this.destinationRepo.listByOrganization(ctx.organizationId);
    return list.map(toDestinationDto);
  }

  /**
   * Creates a new publication binding an immutable article version to a destination.
   * Enforces tenant boundaries and uniqueness: UNIQUE (articleVersionId, destinationId).
   */
  async createPublication(
    ctx: CommandContext,
    input: CreatePublicationInput,
  ): Promise<PublicationDto> {
    // 1. Verify destination belongs to tenant
    const destination = await this.destinationRepo.findForOrganization(
      ctx.organizationId,
      input.destinationId,
    );
    if (!destination) {
      throw new DestinationNotFoundError(input.destinationId, ctx.organizationId);
    }

    // 2. Verify article belongs to tenant
    const article = await this.articleRepo.findArticleForOrganization(
      ctx.organizationId,
      input.articleId,
    );
    if (!article) {
      throw new PublishingError(
        `Article '${input.articleId}' not found in organization '${ctx.organizationId}'`,
      );
    }

    // 3. Verify article version exists for article
    const version = await this.articleVersionRepo.findForArticle(
      input.articleId,
      input.articleVersionId,
    );
    if (!version) {
      throw new PublishingError(
        `Article version '${input.articleVersionId}' not found for article '${input.articleId}'`,
      );
    }

    // 4. Enforce uniqueness: check if publication already exists
    const existing = await this.publicationRepo.findByVersionAndDestination(
      ctx.organizationId,
      input.articleVersionId,
      input.destinationId,
    );
    if (existing) {
      throw new DuplicatePublicationError(input.articleVersionId, input.destinationId);
    }

    const initialStatus = input.initialStatus || 'PENDING';

    // 5. Create publication
    const created = await this.publicationRepo.create({
      organizationId: ctx.organizationId,
      articleId: input.articleId,
      articleVersionId: input.articleVersionId,
      destinationId: input.destinationId,
      status: initialStatus,
      overrides: input.overrides || {},
    });

    // 6. Record append-only initial event
    const correlationId = ctx.correlationId || crypto.randomUUID();
    await this.publicationEventRepo.create({
      publicationId: created.id,
      eventType: initialStatus === 'QUEUED' ? 'QUEUED' : 'CREATED',
      correlationId,
      metadata: {
        articleId: input.articleId,
        articleVersionId: input.articleVersionId,
        destinationId: input.destinationId,
        destinationType: destination.type,
      },
    });

    return toPublicationDto(created);
  }

  /**
   * Updates publication status and records an immutable, append-only event.
   */
  async updatePublicationStatus(
    ctx: CommandContext,
    input: UpdatePublicationStatusInput,
  ): Promise<PublicationDto> {
    const existing = await this.publicationRepo.findForOrganization(
      ctx.organizationId,
      input.publicationId,
    );
    if (!existing) {
      throw new PublicationNotFoundError(input.publicationId, ctx.organizationId);
    }

    const nextAttemptCount = (existing.attemptCount || 0) + 1;
    const lastAttemptAt = input.lastAttemptAt || new Date();

    const updated = await this.publicationRepo.updateStatus(
      input.publicationId,
      ctx.organizationId,
      {
        status: input.status,
        externalResourceId: input.externalResourceId,
        externalUrl: input.externalUrl,
        publishedAt: input.publishedAt,
        lastAttemptAt,
        attemptCount: nextAttemptCount,
        lastErrorCode: input.lastErrorCode,
        lastErrorMessage: input.lastErrorMessage,
        overrides: input.overrides,
      },
    );

    // Map status transition to append-only event type
    let eventType = 'UPDATED';
    if (input.status === 'QUEUED') eventType = 'QUEUED';
    else if (input.status === 'PUBLISHING') eventType = 'STARTED';
    else if (input.status === 'PUBLISHED') eventType = 'SUCCEEDED';
    else if (input.status === 'RETRYING') eventType = 'RETRY_SCHEDULED';
    else if (input.status === 'FAILED') eventType = 'FAILED';

    const correlationId = ctx.correlationId || crypto.randomUUID();
    await this.publicationEventRepo.create({
      publicationId: updated.id,
      eventType,
      correlationId,
      metadata: {
        previousStatus: existing.status,
        newStatus: input.status,
        externalResourceId: input.externalResourceId,
        externalUrl: input.externalUrl,
        errorCode: input.lastErrorCode,
        errorMessage: input.lastErrorMessage,
      },
    });

    return toPublicationDto(updated);
  }

  /**
   * Retrieves a publication by ID within tenant boundaries.
   */
  async getPublication(ctx: CommandContext, publicationId: string): Promise<PublicationDto> {
    const publication = await this.publicationRepo.findForOrganization(
      ctx.organizationId,
      publicationId,
    );
    if (!publication) {
      throw new PublicationNotFoundError(publicationId, ctx.organizationId);
    }
    return toPublicationDto(publication);
  }

  /**
   * Lists all publications for a specific article version within tenant boundaries.
   */
  async listPublicationsForVersion(
    ctx: CommandContext,
    articleVersionId: string,
  ): Promise<PublicationDto[]> {
    const list = await this.publicationRepo.listByArticleVersion(
      ctx.organizationId,
      articleVersionId,
    );
    return list.map(toPublicationDto);
  }

  /**
   * Lists all publications for an article within tenant boundaries.
   */
  async listPublicationsForArticle(
    ctx: CommandContext,
    articleId: string,
  ): Promise<PublicationDto[]> {
    const list = await this.publicationRepo.listByArticle(ctx.organizationId, articleId);
    return list.map(toPublicationDto);
  }

  /**
   * Retrieves the immutable history of events for a publication within tenant boundaries.
   */
  async getPublicationHistory(
    ctx: CommandContext,
    publicationId: string,
  ): Promise<PublicationEventDto[]> {
    const publication = await this.publicationRepo.findForOrganization(
      ctx.organizationId,
      publicationId,
    );
    if (!publication) {
      throw new PublicationNotFoundError(publicationId, ctx.organizationId);
    }

    const events = await this.publicationEventRepo.listByPublication(publicationId);
    return events.map(toPublicationEventDto);
  }

  /**
   * Manually retries a failed, retrying, or unknown outcome publication.
   * Resets status to QUEUED, logs audit event, and dispatches background retry workflow.
   */
  async retryPublication(ctx: CommandContext, publicationId: string): Promise<PublicationDto> {
    const publication = await this.publicationRepo.findForOrganization(
      ctx.organizationId,
      publicationId,
    );
    if (!publication) {
      throw new PublicationNotFoundError(publicationId, ctx.organizationId);
    }

    if (publication.status === 'PUBLISHED') {
      throw new InvalidPublicationStateError(
        `Publication '${publicationId}' is already published and cannot be retried.`,
      );
    }

    if (publication.status === 'PUBLISHING') {
      throw new InvalidPublicationStateError(
        `Publication '${publicationId}' is currently executing and cannot be retried.`,
      );
    }

    const nextAttemptCount = (publication.attemptCount || 0) + 1;
    const correlationId = ctx.correlationId || crypto.randomUUID();

    // 1. Reset state to QUEUED
    const updated = await this.publicationRepo.updateStatus(publicationId, ctx.organizationId, {
      status: 'QUEUED',
      lastAttemptAt: new Date(),
      attemptCount: nextAttemptCount,
      lastErrorCode: null,
      lastErrorMessage: null,
    });

    // 2. Record append-only audit event
    await this.publicationEventRepo.create({
      publicationId: updated.id,
      eventType: 'QUEUED',
      correlationId,
      metadata: {
        previousStatus: publication.status,
        newStatus: 'QUEUED',
        reason: 'Manual retry requested',
        attemptCount: nextAttemptCount,
      },
    });

    // 3. Enqueue background retry job
    const idempotencyKey = `${ctx.organizationId}:${publication.id}:retry:${Date.now()}`;
    await this.jobQueue.enqueue({
      type: 'RETRY_PUBLICATION',
      organizationId: ctx.organizationId,
      referenceType: 'PUBLICATION',
      referenceId: publication.id,
      idempotencyKey,
      correlationId,
      payload: {
        publicationId: publication.id,
        organizationId: ctx.organizationId,
        correlationId,
      },
    });

    return toPublicationDto(updated);
  }

  /**
   * Computes the aggregate distribution status across all publications for an article version.
   */
  async getDistributionStatusForArticleVersion(
    ctx: CommandContext,
    articleVersionId: string,
  ): Promise<DistributionStatus> {
    const publications = await this.publicationRepo.listByArticleVersion(
      ctx.organizationId,
      articleVersionId,
    );
    return calculateDistributionStatus(publications);
  }
}

export const publicationService = new PublicationService();
