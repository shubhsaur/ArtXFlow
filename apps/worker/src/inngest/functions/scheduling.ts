import { inngest } from '../client';
import { INNGEST_EVENTS } from '../events';
import { NonRetriableError } from 'inngest';
import {
  scheduleRepository,
  articleRepository,
  articleVersionRepository,
  destinationRepository,
  platformConnectionRepository,
} from '@artxflow/database';
import { PublishArticleService } from '@artxflow/publishing';
import { createInngestJobQueue } from '../queue-adapter';
import type { DestinationOverrides } from '@artxflow/types';

/**
 * Scheduled publication workflow.
 * 1. Sleeps durably until the requested publish time.
 * 2. Re-validates schedule status: if CANCELED, aborts execution.
 * 3. Re-validates article, captured version snapshot, destinations, and connections.
 * 4. Surfaces invalid destination errors clearly with dedicated error codes.
 * 5. Triggers destination publication workflows using the captured version and overrides.
 * 6. Marks schedule as COMPLETED.
 */
export const scheduleCreated = inngest.createFunction(
  {
    id: 'schedule-created',
    name: 'Execute Scheduled Publication',
    retries: 2,
  },
  { event: INNGEST_EVENTS.SCHEDULE_CREATED },
  async ({ event, step }) => {
    const { scheduleId, organizationId, scheduledAt, correlationId } = event.data;

    // Step 1: Durably sleep until target scheduled time
    await step.sleepUntil('wait-for-scheduled-time', new Date(scheduledAt));

    // Step 2: Reload schedule state, check cancellation guard, and acquire execution lock
    const scheduleState = await step.run('revalidate-schedule-and-lock', async () => {
      const schedule = await scheduleRepository.findForOrganization(organizationId, scheduleId);
      if (!schedule) {
        throw new NonRetriableError(
          `Schedule '${scheduleId}' not found in organization '${organizationId}'`,
        );
      }

      // Cancellation guard: Canceled schedules MUST NOT publish
      if (schedule.status === 'CANCELED') {
        return {
          shouldExecute: false,
          reason: 'CANCELED',
          message: `Schedule '${scheduleId}' was canceled. Skipping execution.`,
          schedule,
        };
      }

      // Idempotency guard: Prevent duplicate execution if already running or finished
      if (schedule.status !== 'SCHEDULED') {
        return {
          shouldExecute: false,
          reason: schedule.status,
          message: `Schedule '${scheduleId}' is already in status '${schedule.status}'. Skipping execution.`,
          schedule,
        };
      }

      // Acquire execution lock
      const locked = await scheduleRepository.updateStatus(scheduleId, organizationId, {
        status: 'EXECUTING',
      });

      return {
        shouldExecute: true,
        reason: 'ACTIVE',
        message: 'Lock acquired',
        schedule: locked,
      };
    });

    if (!scheduleState.shouldExecute) {
      return {
        scheduleId,
        status: scheduleState.reason,
        message: scheduleState.message,
      };
    }

    const currentSchedule = scheduleState.schedule;

    try {
      // Step 3: Revalidate execution prerequisites (article, version, destinations, connections)
      await step.run('validate-execution-prerequisites', async () => {
        // Revalidate article
        const article = await articleRepository.findById(currentSchedule.articleId);
        if (!article || article.organizationId !== organizationId) {
          const errorMsg = `Article '${currentSchedule.articleId}' no longer exists or does not belong to organization`;
          await scheduleRepository.updateStatus(scheduleId, organizationId, {
            status: 'FAILED',
            errorCode: 'ARTICLE_NOT_FOUND',
            errorMessage: errorMsg,
          });
          throw new NonRetriableError(errorMsg);
        }

        // Revalidate captured article version snapshot
        const version = await articleVersionRepository.findById(currentSchedule.articleVersionId);
        if (!version || version.articleId !== article.id) {
          const errorMsg = `Article version '${currentSchedule.articleVersionId}' no longer exists for article '${article.id}'`;
          await scheduleRepository.updateStatus(scheduleId, organizationId, {
            status: 'FAILED',
            errorCode: 'VERSION_NOT_FOUND',
            errorMessage: errorMsg,
          });
          throw new NonRetriableError(errorMsg);
        }

        // Revalidate destination IDs
        const destinationIds = (currentSchedule.destinationIds as string[]) || [];
        if (destinationIds.length === 0) {
          const errorMsg = 'No destinations configured for this schedule';
          await scheduleRepository.updateStatus(scheduleId, organizationId, {
            status: 'FAILED',
            errorCode: 'NO_DESTINATIONS',
            errorMessage: errorMsg,
          });
          throw new NonRetriableError(errorMsg);
        }

        for (const destId of destinationIds) {
          const destination = await destinationRepository.findForOrganization(
            organizationId,
            destId,
          );

          if (!destination) {
            const errorMsg = `Destination '${destId}' not found in organization '${organizationId}'`;
            await scheduleRepository.updateStatus(scheduleId, organizationId, {
              status: 'FAILED',
              errorCode: 'INVALID_DESTINATION',
              errorMessage: errorMsg,
            });
            throw new NonRetriableError(errorMsg);
          }

          if (destination.status !== 'ACTIVE') {
            const errorMsg = `Destination '${destination.name}' (${destId}) is not in ACTIVE state (current: ${destination.status})`;
            await scheduleRepository.updateStatus(scheduleId, organizationId, {
              status: 'FAILED',
              errorCode: 'INVALID_DESTINATION',
              errorMessage: errorMsg,
            });
            throw new NonRetriableError(errorMsg);
          }

          // If destination relies on platform connection, verify connection status
          if (destination.connectionId) {
            const connection = await platformConnectionRepository.findForOrganization(
              organizationId,
              destination.connectionId,
            );
            if (!connection || connection.status !== 'CONNECTED') {
              const errorMsg = `Platform connection for destination '${destination.name}' is inactive or deleted`;
              await scheduleRepository.updateStatus(scheduleId, organizationId, {
                status: 'FAILED',
                errorCode: 'INVALID_CONNECTION',
                errorMessage: errorMsg,
              });
              throw new NonRetriableError(errorMsg);
            }
          }
        }
      });

      // Step 4: Trigger publication workflow using the captured version and overrides
      const publishResult = await step.run('trigger-scheduled-publication', async () => {
        const queue = createInngestJobQueue();
        const publishService = new PublishArticleService({ jobQueue: queue });

        const destinationIds = (currentSchedule.destinationIds as string[]) || [];
        const overrides =
          (currentSchedule.destinationOverrides as Record<string, DestinationOverrides>) || {};

        return await publishService.publishArticle(
          {
            userId: 'system',
            organizationId,
            correlationId,
          },
          {
            articleId: currentSchedule.articleId,
            articleVersionId: currentSchedule.articleVersionId,
            destinationIds,
            destinationOverrides: overrides,
          },
        );
      });

      // Step 5: Mark schedule as COMPLETED
      await step.run('persist-schedule-completion', async () => {
        await scheduleRepository.updateStatus(scheduleId, organizationId, {
          status: 'COMPLETED',
          executedAt: new Date(),
          errorMessage: null,
          errorCode: null,
        });
      });

      return {
        scheduleId,
        status: 'COMPLETED',
        articleVersionId: currentSchedule.articleVersionId,
        executedAt: new Date().toISOString(),
        publicationCount: publishResult.publications.length,
      };
    } catch (err) {
      // Step 6: On error, record FAILED state with details
      const errorMessage = err instanceof Error ? err.message : String(err);
      await step.run('persist-schedule-failure', async () => {
        const latest = await scheduleRepository.findForOrganization(organizationId, scheduleId);
        // Only update if not already tagged with specific error code in step 3
        if (latest && latest.status !== 'FAILED') {
          await scheduleRepository.updateStatus(scheduleId, organizationId, {
            status: 'FAILED',
            errorCode: 'EXECUTION_ERROR',
            errorMessage,
          });
        }
      });

      throw err;
    }
  },
);
