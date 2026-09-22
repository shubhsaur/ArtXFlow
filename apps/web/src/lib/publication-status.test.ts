import { describe, it, expect } from 'vitest';
import type { PublicationDto } from '@artxflow/publishing';
import {
  resolveExtensionTargets,
  isDestinationStale,
  getLatestPublicationForDestination,
} from './publication-status';

const orgId = 'org-1';
const articleId = 'art-1';
const versionV1 = 'ver-v1';
const versionV2 = 'ver-v2';
const destHashnode = 'dest-hashnode';
const destMedium = 'dest-medium';

function makePublication(overrides: Partial<PublicationDto>): PublicationDto {
  return {
    id: 'pub-default',
    organizationId: orgId,
    articleId,
    articleVersionId: versionV1,
    destinationId: destHashnode,
    status: 'PENDING',
    externalResourceId: null,
    externalUrl: null,
    publishedAt: null,
    lastAttemptAt: null,
    attemptCount: 0,
    lastErrorCode: null,
    lastErrorMessage: null,
    overrides: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('resolveExtensionTargets', () => {
  it('returns create mode when a destination has no publications at all', () => {
    const results = resolveExtensionTargets([], [destHashnode]);

    expect(results).toEqual([{ destinationId: destHashnode, mode: 'create' }]);
  });

  it('returns create mode when the only rows never reached PUBLISHED with a URL', () => {
    const publications = [
      makePublication({ id: 'pub-1', status: 'FAILED' }),
      makePublication({ id: 'pub-2', status: 'PENDING' }),
      makePublication({ id: 'pub-3', status: 'PENDING', destinationId: destMedium }),
    ];

    const results = resolveExtensionTargets(publications, [destHashnode, destMedium]);

    expect(results.every((r) => r.mode === 'create')).toBe(true);
  });

  it('returns update mode with the remote target when a PUBLISHED row with URL exists', () => {
    const publications = [
      makePublication({
        id: 'pub-published',
        status: 'PUBLISHED',
        articleVersionId: versionV1,
        externalResourceId: 'post-id-123',
        externalUrl: 'https://blog.hashnode.dev/my-post',
        publishedAt: '2026-01-05T00:00:00.000Z',
      }),
    ];

    const results = resolveExtensionTargets(publications, [destHashnode]);

    expect(results).toEqual([
      {
        destinationId: destHashnode,
        mode: 'update',
        target: {
          publicationId: 'pub-published',
          externalUrl: 'https://blog.hashnode.dev/my-post',
          externalResourceId: 'post-id-123',
        },
      },
    ]);
  });

  it('falls back to the external URL as the resource id when none was stored', () => {
    const publications = [
      makePublication({
        id: 'pub-published',
        destinationId: destMedium,
        status: 'PUBLISHED',
        externalResourceId: null,
        externalUrl: 'https://medium.com/p/e7e1290a1040',
        publishedAt: '2026-01-05T00:00:00.000Z',
      }),
    ];

    const results = resolveExtensionTargets(publications, [destMedium]);

    expect(results[0]?.mode).toBe('update');
    expect(results[0]?.target?.externalResourceId).toBe('https://medium.com/p/e7e1290a1040');
  });

  it('targets the most recent PUBLISHED row when several versions were published', () => {
    const publications = [
      makePublication({
        id: 'pub-old',
        status: 'PUBLISHED',
        externalUrl: 'https://blog.hashnode.dev/my-post',
        externalResourceId: 'old-id',
        articleVersionId: versionV1,
        publishedAt: '2026-01-05T00:00:00.000Z',
        createdAt: '2026-01-05T00:00:00.000Z',
      }),
      makePublication({
        id: 'pub-new',
        status: 'PUBLISHED',
        externalUrl: 'https://blog.hashnode.dev/my-post-updated',
        externalResourceId: 'new-id',
        articleVersionId: versionV2,
        publishedAt: '2026-02-01T00:00:00.000Z',
        createdAt: '2026-02-01T00:00:00.000Z',
      }),
      // A newer in-flight row must NOT hide the published target
      makePublication({
        id: 'pub-inflight',
        status: 'PENDING',
        articleVersionId: versionV2,
        createdAt: '2026-02-05T00:00:00.000Z',
      }),
    ];

    const results = resolveExtensionTargets(publications, [destHashnode]);

    expect(results[0]?.target?.publicationId).toBe('pub-new');
    expect(results[0]?.target?.externalResourceId).toBe('new-id');
  });

  it('decides each destination independently', () => {
    const publications = [
      makePublication({
        id: 'pub-hn',
        destinationId: destHashnode,
        status: 'PUBLISHED',
        externalUrl: 'https://blog.hashnode.dev/my-post',
        externalResourceId: 'hn-id',
        publishedAt: '2026-01-05T00:00:00.000Z',
      }),
      makePublication({
        id: 'pub-md-failed',
        destinationId: destMedium,
        status: 'FAILED',
      }),
    ];

    const results = resolveExtensionTargets(publications, [destHashnode, destMedium]);

    expect(results.find((r) => r.destinationId === destHashnode)?.mode).toBe('update');
    expect(results.find((r) => r.destinationId === destMedium)?.mode).toBe('create');
  });
});


describe('isDestinationStale', () => {
  const publishedRow = makePublication({
    id: 'pub-published',
    status: 'PUBLISHED',
    articleVersionId: versionV1,
    externalUrl: 'https://blog.hashnode.dev/my-post',
    publishedAt: '2026-01-05T00:00:00.000Z',
    createdAt: '2026-01-05T00:00:00.000Z',
  });

  it('is false when the latest row is PUBLISHED', () => {
    expect(isDestinationStale([publishedRow], destHashnode)).toBe(false);
    expect(isDestinationStale([publishedRow], destHashnode, versionV1)).toBe(false);
  });

  it('is false when the destination has no publications', () => {
    expect(isDestinationStale([], destHashnode)).toBe(false);
  });

  it('is false when nothing was ever published (no remote copy to lag behind)', () => {
    expect(
      isDestinationStale([makePublication({ id: 'pub-1', status: 'FAILED' })], destHashnode),
    ).toBe(false);
  });

  it('is true when an older PUBLISHED row exists but the latest row is still pending', () => {
    const publications = [
      makePublication({
        id: 'pub-inflight',
        status: 'PENDING',
        articleVersionId: versionV2,
        createdAt: '2026-02-05T00:00:00.000Z',
      }),
      publishedRow,
    ];

    expect(isDestinationStale(publications, destHashnode)).toBe(true);
  });

  it('is true when the latest PUBLISHED row is for an older article version', () => {
    expect(isDestinationStale([publishedRow], destHashnode, versionV2)).toBe(true);
    expect(isDestinationStale([publishedRow], destHashnode, versionV1)).toBe(false);
  });
});

describe('getLatestPublicationForDestination', () => {
  it('returns the most recent row regardless of status', () => {
    const publications = [
      makePublication({
        id: 'pub-a',
        status: 'PUBLISHED',
        createdAt: '2026-01-05T00:00:00.000Z',
        publishedAt: '2026-01-05T00:00:00.000Z',
      }),
      makePublication({
        id: 'pub-b',
        status: 'FAILED',
        createdAt: '2026-02-01T00:00:00.000Z',
        publishedAt: null,
      }),
    ];

    expect(getLatestPublicationForDestination(publications, destHashnode)?.id).toBe('pub-b');
    expect(getLatestPublicationForDestination([], destHashnode)).toBeUndefined();
  });
});
