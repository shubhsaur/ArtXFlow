import { inngest } from '../client';
import { INNGEST_EVENTS } from '../events';
import { NonRetriableError } from 'inngest';
import { analyticsSyncService } from '@artxflow/publishing';
import { PlatformError } from '@artxflow/platform-adapters';

/**
 * Executes an analytics metrics synchronization workflow for a specific publication (TASK-028).
 * Invariant: Analytics synchronization never alters publication state.
 */
export const analyticsSyncRequested = inngest.createFunction(
  {
    id: 'analytics-sync-requested',
    name: 'Synchronize Publication Analytics',
    retries: 3,
  },
  { event: INNGEST_EVENTS.ANALYTICS_SYNC_REQUESTED },
  async ({ event, step }) => {
    const { publicationId, organizationId, correlationId } = event.data;

    return await step.run('sync-metrics', async () => {
      try {
        const result = await analyticsSyncService.syncPublicationMetrics({
          organizationId,
          publicationId,
          correlationId,
        });
        return result;
      } catch (err) {
        if (err instanceof PlatformError && !err.retryable) {
          throw new NonRetriableError(
            `Platform error during analytics sync: [${err.code}] ${err.message}`,
            { cause: err },
          );
        }
        throw err;
      }
    });
  },
);
