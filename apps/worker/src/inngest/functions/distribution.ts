import { inngest } from '../client';
import { INNGEST_EVENTS } from '../events';
import { publicationRepository } from '@artxflow/database';

/**
 * Multi-destination distribution workflow.
 * Loads all publications associated with an article version distribution and
 * fans out independent destination workflows.
 */
export const distributionRequested = inngest.createFunction(
  {
    id: 'distribution-requested',
    name: 'Fan Out Distribution Publications',
  },
  { event: INNGEST_EVENTS.DISTRIBUTION_REQUESTED },
  async ({ event, step }) => {
    const { distributionId, organizationId, correlationId } = event.data;

    // Load publications targeting this distribution
    const publications = await step.run('load-distribution-publications', async () => {
      // In ArtXFlow, a distributionId maps to an articleVersionId or distribution entity
      return await publicationRepository.listByArticleVersion(organizationId, distributionId);
    });

    if (publications.length === 0) {
      return {
        distributionId,
        message: 'No publications found for this distribution version.',
        fannedOutCount: 0,
      };
    }

    // Fan out independent destination publication workflows
    const events = publications.map((pub) => ({
      name: INNGEST_EVENTS.PUBLICATION_REQUESTED,
      data: {
        publicationId: pub.id,
        organizationId,
        correlationId,
        idempotencyKey: `${organizationId}:${pub.articleVersionId}:${pub.destinationId}`,
      },
    }));

    await step.sendEvent('fan-out-destination-workflows', events);

    return {
      distributionId,
      fannedOutCount: events.length,
      publicationIds: publications.map((p) => p.id),
    };
  },
);
