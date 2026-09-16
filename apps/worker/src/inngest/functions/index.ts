import { publicationRequested, publicationRetryRequested } from './publication';
import { distributionRequested } from './distribution';
import { scheduleCreated } from './scheduling';
import { analyticsSyncRequested } from './analytics';

export * from './publication';
export * from './distribution';
export * from './scheduling';
export * from './analytics';

/**
 * Array of all Inngest workflow functions registered by the ArtXFlow worker.
 */
export const inngestFunctions = [
  publicationRequested,
  publicationRetryRequested,
  distributionRequested,
  scheduleCreated,
  analyticsSyncRequested,
];
