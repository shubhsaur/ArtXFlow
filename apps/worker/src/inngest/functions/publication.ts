import { inngest } from '../client';
import { INNGEST_EVENTS } from '../events';
import { NonRetriableError } from 'inngest';
import {
  publicationRepository,
  publicationEventRepository,
  destinationRepository,
  articleVersionRepository,
  articleRepository,
} from '@artxflow/database';
import { platformConnectionService } from '@artxflow/publishing';
import {
  platformAdapterRegistry,
  PlatformError,
  applyDestinationOverrides,
  type CanonicalArticle,
  type ConnectionCredentials,
  type DestinationOverrides,
} from '@artxflow/platform-adapters';

/**
 * Executes a publication workflow for a specific article version and destination.
 * Implements strict runtime state reloading, idempotency checking, adapter execution,
 * and append-only audit event logging.
 */
export const publicationRequested = inngest.createFunction(
  {
    id: 'publication-requested',
    name: 'Execute Destination Publication',
    retries: 3,
  },
  { event: INNGEST_EVENTS.PUBLICATION_REQUESTED },
  async ({ event, step, attempt }) => {
    const { publicationId, organizationId, correlationId } = event.data;
    const currentAttempt = typeof attempt === 'number' ? attempt : 0;
    const maxRetries = 3;

    // Step 1: Reload current publication state and verify idempotency guard
    const publication = await step.run('load-and-check-idempotency', async () => {
      const pub = await publicationRepository.findForOrganization(organizationId, publicationId);
      if (!pub) {
        throw new Error(
          `Publication '${publicationId}' not found in organization '${organizationId}'`,
        );
      }

      // Idempotency guard: If already published or external resource is already registered, skip further remote mutation
      const isAlreadyPublished = pub.status === 'PUBLISHED' || Boolean(pub.externalResourceId);
      return {
        skip: isAlreadyPublished,
        status: pub.status,
        articleId: pub.articleId,
        articleVersionId: pub.articleVersionId,
        destinationId: pub.destinationId,
        attemptCount: pub.attemptCount,
        externalResourceId: pub.externalResourceId,
        externalUrl: pub.externalUrl,
        overrides: (pub.overrides as Record<string, unknown>) || {},
      };
    });

    if (publication.skip) {
      return {
        message: 'Publication is already published. Skipped duplicate execution.',
        publicationId,
        externalUrl: publication.externalUrl,
        externalResourceId: publication.externalResourceId,
      };
    }

    // Step 2: Transition state to PUBLISHING and record append-only STARTED event
    await step.run('transition-to-publishing', async () => {
      await publicationRepository.updateStatus(publicationId, organizationId, {
        status: 'PUBLISHING',
        lastAttemptAt: new Date(),
        attemptCount: (publication.attemptCount || 0) + 1,
      });

      await publicationEventRepository.create({
        publicationId,
        eventType: 'STARTED',
        correlationId,
        metadata: {
          previousStatus: publication.status,
          newStatus: 'PUBLISHING',
          attempt: currentAttempt,
        },
      });
    });

    // Step 3: Reload destination and canonical article snapshot from database
    const context = await step.run('load-publication-context', async () => {
      const [destination, article, version] = await Promise.all([
        destinationRepository.findForOrganization(organizationId, publication.destinationId!),
        articleRepository.findById(publication.articleId!),
        articleVersionRepository.findById(publication.articleVersionId!),
      ]);

      if (!destination) {
        throw new Error(`Destination '${publication.destinationId}' not found`);
      }
      if (!article || !version) {
        throw new Error(`Article or version snapshot not found`);
      }

      const destinationDefaults = (destination.config?.overrides as Record<string, unknown>) || {};
      const mergedOverrides = {
        ...destinationDefaults,
        ...publication.overrides,
      };

      return {
        destination: {
          id: destination.id,
          type: destination.type,
          name: destination.name,
          connectionId: destination.connectionId,
          config: {
            ...destination.config,
            siteId: destination.siteId ?? destination.config?.siteId,
          },
        },
        canonicalArticle: {
          id: article.id,
          versionId: version.id,
          title: article.title,
          excerpt: article.excerpt,
          markdown: version.content,
          tags: [],
        } as CanonicalArticle,
        overrides: mergedOverrides as DestinationOverrides,
      };
    });

    // Step 4: Execute publication via platform adapter
    try {
      const publishResult = await step.run('execute-platform-publish', async () => {
        const effectiveArticle = applyDestinationOverrides(
          context.canonicalArticle,
          context.overrides,
        );
        const adapter = platformAdapterRegistry.get(context.destination.type);

        let credentials: ConnectionCredentials | undefined;
        if (context.destination.connectionId) {
          const secret = await platformConnectionService.getDecryptedSecret(
            { userId: 'system', organizationId },
            context.destination.connectionId,
          );
          credentials = {
            apiKey: secret,
            token: secret,
          };
        }

        if (adapter) {
          const platformArticle = await adapter.transform(effectiveArticle);
          const validation = await adapter.validate(platformArticle);

          if (!validation.isValid) {
            throw new PlatformError({
              provider: context.destination.type,
              code: 'VALIDATION_ERROR',
              message: `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
              retryable: false,
            });
          }

          return await adapter.publish({
            publicationId,
            article: platformArticle,
            credentials,
            destinationConfig: context.destination.config as Record<string, unknown>,
            idempotencyKey: event.data.idempotencyKey,
          });
        }

        // Fallback for internal ArtXFlow site destination
        return {
          externalResourceId: publicationId,
          externalUrl: `/sites/${context.destination.name}/${effectiveArticle.id}`,
          publishedAt: new Date().toISOString(),
        };
      });

      // Step 5: Persist successful publication state and record SUCCEEDED event
      await step.run('persist-publication-success', async () => {
        await publicationRepository.updateStatus(publicationId, organizationId, {
          status: 'PUBLISHED',
          externalResourceId: publishResult.externalResourceId,
          externalUrl: publishResult.externalUrl,
          publishedAt: new Date(publishResult.publishedAt),
          lastErrorCode: null,
          lastErrorMessage: null,
        });

        await publicationEventRepository.create({
          publicationId,
          eventType: 'SUCCEEDED',
          correlationId,
          metadata: {
            externalResourceId: publishResult.externalResourceId,
            externalUrl: publishResult.externalUrl,
          },
        });
      });

      return {
        status: 'PUBLISHED',
        publicationId,
        externalUrl: publishResult.externalUrl,
      };
    } catch (err) {
      // Step 6: On error, classify failure mode
      const isPlatformErr = PlatformError.isPlatformError(err);
      const errorCode = isPlatformErr ? err.code : 'PROVIDER_ERROR';
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isUnknownOutcome = errorCode === 'UNKNOWN_OUTCOME';
      const isRetryable = PlatformError.isRetryable(err) && !isUnknownOutcome;
      const retriesExhausted = currentAttempt >= maxRetries;

      let nextStatus: 'RETRYING' | 'FAILED' | 'UNKNOWN_OUTCOME';
      let eventType: 'RETRY_SCHEDULED' | 'FAILED' | 'UNKNOWN_OUTCOME';

      if (isUnknownOutcome) {
        nextStatus = 'UNKNOWN_OUTCOME';
        eventType = 'UNKNOWN_OUTCOME';
      } else if (isRetryable && !retriesExhausted) {
        nextStatus = 'RETRYING';
        eventType = 'RETRY_SCHEDULED';
      } else {
        nextStatus = 'FAILED';
        eventType = 'FAILED';
      }

      await step.run('persist-publication-failure', async () => {
        await publicationRepository.updateStatus(publicationId, organizationId, {
          status: nextStatus,
          lastErrorCode: retriesExhausted && isRetryable ? 'MAX_RETRIES_EXCEEDED' : errorCode,
          lastErrorMessage: errorMessage,
        });

        await publicationEventRepository.create({
          publicationId,
          eventType,
          correlationId,
          metadata: {
            errorCode,
            errorMessage,
            retryable: isRetryable,
            attempt: currentAttempt,
            maxRetries,
            retriesExhausted,
            unknownOutcome: isUnknownOutcome,
          },
        });
      });

      // If permanent, unknown outcome, or retries exhausted, stop retrying immediately
      if (!isRetryable || retriesExhausted || isUnknownOutcome) {
        throw new NonRetriableError(errorMessage, { cause: err });
      }

      // Re-throw retryable error to trigger Inngest backoff retry
      throw err;
    }
  },
);

/**
 * Manually retries a failed publication.
 */
export const publicationRetryRequested = inngest.createFunction(
  {
    id: 'publication-retry-requested',
    name: 'Retry Destination Publication',
  },
  { event: INNGEST_EVENTS.PUBLICATION_RETRY_REQUESTED },
  async ({ event, step }) => {
    const { publicationId, organizationId, correlationId } = event.data;

    await step.run('verify-and-reset-for-retry', async () => {
      const pub = await publicationRepository.findForOrganization(organizationId, publicationId);
      if (!pub) {
        throw new Error(`Publication '${publicationId}' not found`);
      }

      if (pub.status === 'PUBLISHED') {
        return;
      }

      await publicationRepository.updateStatus(publicationId, organizationId, {
        status: 'QUEUED',
      });

      await publicationEventRepository.create({
        publicationId,
        eventType: 'QUEUED',
        correlationId,
        metadata: { reason: 'Manual retry requested' },
      });
    });

    await step.sendEvent('trigger-publication-retry', {
      name: INNGEST_EVENTS.PUBLICATION_REQUESTED,
      data: {
        publicationId,
        organizationId,
        correlationId,
      },
    });

    return { publicationId, status: 'QUEUED' };
  },
);
