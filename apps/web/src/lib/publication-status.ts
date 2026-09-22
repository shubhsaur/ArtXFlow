import type { PublicationDto } from '@artxflow/publishing';

/**
 * Client-managed (browser/extension) publish-mode helpers.
 *
 * Mirrors the worker's create-vs-update rule from TASK-032
 * (`findLatestPublishedForArticleAndDestination`): if a destination already has
 * a PUBLISHED publication with an external URL, re-publishing should UPDATE the
 * existing remote post instead of creating a duplicate.
 */

export interface ExtensionTargetResult {
  destinationId: string;
  mode: 'create' | 'update';
  /** Present only when mode === 'update' — the remote post to edit in place. */
  target?: {
    publicationId: string;
    externalUrl: string;
    externalResourceId: string;
  };
}

/** Sort comparator: most recent publication first. */
function byMostRecent(a: PublicationDto, b: PublicationDto): number {
  const aTime = Date.parse(a.publishedAt || a.createdAt || '') || 0;
  const bTime = Date.parse(b.publishedAt || b.createdAt || '') || 0;
  return bTime - aTime;
}

/** Returns the most recent publication row for a destination, if any. */
export function getLatestPublicationForDestination(
  publications: PublicationDto[],
  destinationId: string,
): PublicationDto | undefined {
  return publications
    .filter((pub) => pub.destinationId === destinationId)
    .sort(byMostRecent)[0];
}

/**
 * Returns the most recent PUBLISHED publication (with a remote URL) for a
 * destination — i.e. the remote post an extension update must target.
 */
export function getLatestPublishedWithUrl(
  publications: PublicationDto[],
  destinationId: string,
): PublicationDto | undefined {
  return publications
    .filter(
      (pub) =>
        pub.destinationId === destinationId &&
        pub.status === 'PUBLISHED' &&
        Boolean(pub.externalUrl),
    )
    .sort(byMostRecent)[0];
}

/**
 * Decides, per destination, whether the extension should CREATE a new remote
 * post or UPDATE the existing one when the user publishes.
 */
export function resolveExtensionTargets(
  publications: PublicationDto[],
  destinationIds: string[],
): ExtensionTargetResult[] {
  return destinationIds.map((destinationId) => {
    const published = getLatestPublishedWithUrl(publications, destinationId);

    if (published && published.externalUrl) {
      return {
        destinationId,
        mode: 'update' as const,
        target: {
          publicationId: published.id,
          externalUrl: published.externalUrl,
          externalResourceId: published.externalResourceId || published.externalUrl,
        },
      };
    }

    return { destinationId, mode: 'create' as const };
  });
}

/**
 * True when a destination's remote copy is behind ArtXFlow state:
 * - an older row reached PUBLISHED, but the most recent row has not (an update
 *   is in flight / failed / pending), or
 * - a published row exists for a different article version than the one the
 *   caller currently holds (optional `currentVersionId`), e.g. the article was
 *   edited but not re-published yet.
 */
export function isDestinationStale(
  publications: PublicationDto[],
  destinationId: string,
  currentVersionId?: string,
): boolean {
  const rows = publications
    .filter((pub) => pub.destinationId === destinationId)
    .sort(byMostRecent);

  const latest = rows[0];
  if (!latest) return false;

  const hasPublished = rows.some((pub) => pub.status === 'PUBLISHED');

  if (latest.status !== 'PUBLISHED' && hasPublished) {
    return true;
  }

  if (
    currentVersionId &&
    latest.status === 'PUBLISHED' &&
    latest.articleVersionId !== currentVersionId
  ) {
    return true;
  }

  return false;
}
