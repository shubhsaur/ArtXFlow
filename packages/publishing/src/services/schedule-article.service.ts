import {
  scheduleRepository,
  articleRepository,
  articleVersionRepository,
  destinationRepository,
  organizationRepository,
  siteRepository,
  type ScheduleRepository,
  type ArticleRepository,
  type ArticleVersionRepository,
  type DestinationRepository,
  type OrganizationRepository,
  type SiteRepository,
  type Destination,
} from '@artxflow/database';
import type { DestinationOverrides, ScheduleStatus } from '@artxflow/types';
import { toScheduleDto, type ScheduleDto } from '../models';
import {
  UnauthorizedTenantAccessError,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
} from '../errors';
import type { JobQueue } from '../queue/job-queue';
import { WorkflowJobQueue } from '../queue/workflow-job-queue';
import type { CommandContext } from './publication.service';
import { normalizeScheduledTimeToUtc, validateFutureScheduledTime } from '../utils/timezone';

export interface ScheduleArticleInput {
  articleId: string;
  destinationIds?: string[];
  articleVersionId?: string;
  scheduledAt: string | Date;
  timezone?: string;
  destinationOverrides?: Record<string, DestinationOverrides>;
}

export interface ScheduleArticleServiceOptions {
  scheduleRepo?: ScheduleRepository;
  articleRepo?: ArticleRepository;
  articleVersionRepo?: ArticleVersionRepository;
  destinationRepo?: DestinationRepository;
  siteRepo?: SiteRepository;
  orgRepo?: OrganizationRepository;
  jobQueue?: JobQueue;
}

export class ScheduleArticleService {
  private readonly scheduleRepo: ScheduleRepository;
  private readonly articleRepo: ArticleRepository;
  private readonly articleVersionRepo: ArticleVersionRepository;
  private readonly destinationRepo: DestinationRepository;
  private readonly siteRepo: SiteRepository;
  private readonly orgRepo: OrganizationRepository;
  private readonly jobQueue: JobQueue;

  constructor(options: ScheduleArticleServiceOptions = {}) {
    this.scheduleRepo = options.scheduleRepo ?? scheduleRepository;
    this.articleRepo = options.articleRepo ?? articleRepository;
    this.articleVersionRepo = options.articleVersionRepo ?? articleVersionRepository;
    this.destinationRepo = options.destinationRepo ?? destinationRepository;
    this.siteRepo = options.siteRepo ?? siteRepository;
    this.orgRepo = options.orgRepo ?? organizationRepository;
    this.jobQueue = options.jobQueue ?? new WorkflowJobQueue();
  }

  /**
   * Schedules an article publication for a future normalized UTC time.
   * Captures the article version snapshot at scheduling time.
   */
  async scheduleArticle(ctx: CommandContext, input: ScheduleArticleInput): Promise<ScheduleDto> {
    // 1. Authorize tenant access
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    // 2. Validate article exists and is publishable
    const article = await this.articleRepo.findArticleForOrganization(
      ctx.organizationId,
      input.articleId,
    );
    if (!article) {
      throw new ArticleNotFoundError(input.articleId, ctx.organizationId);
    }
    if (article.status === 'ARCHIVED') {
      throw new ArticleNotPublishableError(
        `Cannot schedule archived article '${input.articleId}'. Restore it to DRAFT or READY first.`,
      );
    }

    // 3. Resolve and capture immutable article version snapshot
    let version;
    if (input.articleVersionId) {
      version = await this.articleVersionRepo.findForArticle(
        input.articleId,
        input.articleVersionId,
      );
      if (!version) {
        throw new ArticleNotPublishableError(
          `Specified article version '${input.articleVersionId}' not found for article '${input.articleId}'.`,
        );
      }
    } else {
      version = await this.articleVersionRepo.getLatestVersion(input.articleId);
      if (!version) {
        throw new ArticleNotPublishableError(
          `Article '${input.articleId}' has no content versions to schedule.`,
        );
      }
    }

    // 4. Resolve & validate destinations
    let targetDestinations: Destination[] = [];
    if (input.destinationIds && input.destinationIds.length > 0) {
      for (const destId of input.destinationIds) {
        const dest = await this.destinationRepo.findForOrganization(ctx.organizationId, destId);
        if (!dest || dest.status !== 'ACTIVE') {
          throw new InvalidDestinationConfigurationError(
            `Destination '${destId}' is not active or not found in organization.`,
          );
        }
        targetDestinations.push(dest);
      }
    } else {
      const orgDestinations = await this.destinationRepo.listByOrganization(ctx.organizationId);
      targetDestinations = orgDestinations.filter((d) => d.status === 'ACTIVE');

      // If no active destinations exist yet, check for site and auto-provision Blog destination
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

    // 5. Normalize target execution time to UTC and validate it's in the future
    const timezone = input.timezone || 'UTC';
    const utcScheduledAt = normalizeScheduledTimeToUtc(input.scheduledAt, timezone);
    validateFutureScheduledTime(utcScheduledAt);

    // 6. Create schedule record
    const schedule = await this.scheduleRepo.create({
      organizationId: ctx.organizationId,
      articleId: article.id,
      articleVersionId: version.id,
      destinationIds: targetDestinations.map((d) => d.id),
      destinationOverrides:
        (input.destinationOverrides as Record<string, Record<string, unknown>>) || {},
      scheduledAt: utcScheduledAt,
      timezone,
      status: 'SCHEDULED',
    });

    // 7. Enqueue background scheduled workflow via JobQueue
    const correlationId = ctx.correlationId || crypto.randomUUID();
    const idempotencyKey = `${ctx.organizationId}:${schedule.id}:schedule`;
    await this.jobQueue.enqueue({
      type: 'SCHEDULE_ARTICLE',
      organizationId: ctx.organizationId,
      referenceType: 'SCHEDULE',
      referenceId: schedule.id,
      idempotencyKey,
      correlationId,
      payload: {
        scheduleId: schedule.id,
        articleId: article.id,
        articleVersionId: version.id,
        scheduledAt: utcScheduledAt.toISOString(),
        correlationId,
      },
    });

    return toScheduleDto(schedule);
  }

  /**
   * Cancels a pending schedule.
   */
  async cancelSchedule(ctx: CommandContext, scheduleId: string): Promise<ScheduleDto> {
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    const existing = await this.scheduleRepo.findForOrganization(ctx.organizationId, scheduleId);
    if (!existing) {
      throw new ScheduleNotFoundError(scheduleId, ctx.organizationId);
    }

    if (existing.status !== 'SCHEDULED') {
      throw new InvalidScheduleStateError(
        `Cannot cancel schedule '${scheduleId}' because it is in '${existing.status}' status (must be 'SCHEDULED')`,
      );
    }

    const canceled = await this.scheduleRepo.cancel(scheduleId, ctx.organizationId);
    return toScheduleDto(canceled);
  }

  /**
   * Retrieves a schedule by ID scoped to tenant.
   */
  async getSchedule(ctx: CommandContext, scheduleId: string): Promise<ScheduleDto> {
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    const schedule = await this.scheduleRepo.findForOrganization(ctx.organizationId, scheduleId);
    if (!schedule) {
      throw new ScheduleNotFoundError(scheduleId, ctx.organizationId);
    }

    return toScheduleDto(schedule);
  }

  /**
   * Lists all schedules for a specific article.
   */
  async listSchedulesForArticle(ctx: CommandContext, articleId: string): Promise<ScheduleDto[]> {
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    const list = await this.scheduleRepo.listByArticle(ctx.organizationId, articleId);
    return list.map(toScheduleDto);
  }

  /**
   * Lists all schedules for an organization.
   */
  async listSchedulesForOrganization(
    ctx: CommandContext,
    options?: { status?: ScheduleStatus },
  ): Promise<ScheduleDto[]> {
    const membership = await this.orgRepo.getOrganizationForUser(ctx.organizationId, ctx.userId);
    if (!membership) {
      throw new UnauthorizedTenantAccessError(
        'organization',
        ctx.organizationId,
        ctx.organizationId,
      );
    }

    const list = await this.scheduleRepo.listByOrganization(ctx.organizationId, options);
    return list.map(toScheduleDto);
  }
}

export const scheduleArticleService = new ScheduleArticleService();
