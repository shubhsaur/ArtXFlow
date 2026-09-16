import type { PublicationStatus, DistributionStatus } from '@artxflow/types';

/**
 * Derives the aggregate distribution status across all publications for an article version.
 * Adheres to ArtXFlow principles:
 * - Independent destinations: failure of one does not invalidate success of others.
 * - Partial failure is first-class: surfaces PARTIALLY_PUBLISHED when some succeed and some fail.
 */
export function calculateDistributionStatus(
  publications: Array<{ status: PublicationStatus }>,
): DistributionStatus {
  if (publications.length === 0) {
    return 'PENDING';
  }

  const statuses = publications.map((p) => p.status);

  // 1. Complete success across all destinations
  if (statuses.every((s) => s === 'PUBLISHED')) {
    return 'PUBLISHED';
  }

  const hasPublished = statuses.some((s) => s === 'PUBLISHED');
  const hasFailedOrUnknown = statuses.some((s) => s === 'FAILED' || s === 'UNKNOWN_OUTCOME');
  const hasInProgress = statuses.some(
    (s) => s === 'QUEUED' || s === 'PUBLISHING' || s === 'RETRYING',
  );

  // 2. Mixed settled state: at least one succeeded and at least one failed/unknown
  if (hasPublished && hasFailedOrUnknown) {
    if (hasInProgress) {
      return 'IN_PROGRESS';
    }
    return 'PARTIALLY_PUBLISHED';
  }

  // 3. Active execution in progress
  if (hasInProgress) {
    return 'IN_PROGRESS';
  }

  // 4. Complete failure across all destinations
  if (statuses.every((s) => s === 'FAILED' || s === 'UNKNOWN_OUTCOME')) {
    return 'FAILED';
  }

  // 5. Initial pending state
  if (statuses.every((s) => s === 'PENDING')) {
    return 'PENDING';
  }

  return 'IN_PROGRESS';
}
