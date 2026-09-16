import { describe, it, expect } from 'vitest';
import {
  normalizeMetrics,
  aggregateSnapshots,
  type AnalyticsSnapshot,
} from './index';

describe('Analytics Package', () => {
  describe('normalizeMetrics', () => {
    it('normalizes missing metrics to zero', () => {
      const normalized = normalizeMetrics(null);
      expect(normalized).toEqual({
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
      });
    });

    it('clamps negative values to zero and floors decimals', () => {
      const normalized = normalizeMetrics({
        views: 12.8,
        likes: -5,
        comments: 3,
        shares: 0,
        bookmarks: 7,
      });
      expect(normalized).toEqual({
        views: 12,
        likes: 0,
        comments: 3,
        shares: 0,
        bookmarks: 7,
      });
    });
  });

  describe('aggregateSnapshots', () => {
    it('aggregates empty array gracefully', () => {
      const summary = aggregateSnapshots([]);
      expect(summary.views).toBe(0);
      expect(summary.publicationCount).toBe(0);
      expect(summary.snapshotCount).toBe(0);
      expect(summary.firstCapturedAt).toBeNull();
      expect(summary.lastCapturedAt).toBeNull();
    });

    it('aggregates multiple snapshots across publications', () => {
      const snapshots: AnalyticsSnapshot[] = [
        {
          id: 'snap-1',
          organizationId: 'org-1',
          publicationId: 'pub-1',
          capturedAt: '2026-09-15T10:00:00Z',
          views: 100,
          likes: 10,
          comments: 2,
          shares: 1,
          bookmarks: 5,
          metrics: { rawProviderField: 'abc' },
          createdAt: '2026-09-15T10:00:01Z',
        },
        {
          id: 'snap-2',
          organizationId: 'org-1',
          publicationId: 'pub-2',
          capturedAt: '2026-09-17T12:00:00Z',
          views: 250,
          likes: 25,
          comments: 8,
          shares: 4,
          bookmarks: 12,
          metrics: { rawProviderField: 'xyz' },
          createdAt: '2026-09-17T12:00:01Z',
        },
      ];

      const summary = aggregateSnapshots(snapshots);
      expect(summary.views).toBe(350);
      expect(summary.likes).toBe(35);
      expect(summary.comments).toBe(10);
      expect(summary.shares).toBe(5);
      expect(summary.bookmarks).toBe(17);
      expect(summary.publicationCount).toBe(2);
      expect(summary.snapshotCount).toBe(2);
      expect(summary.firstCapturedAt).toBe('2026-09-15T10:00:00.000Z');
      expect(summary.lastCapturedAt).toBe('2026-09-17T12:00:00.000Z');
    });
  });
});
