import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArticlesHubHeader } from './articles-hub-header';
import { ArticlesHubMetrics } from './articles-hub-metrics';
import { ArticlesHubFilterBar } from './articles-hub-filter-bar';
import { ArticlesHubMatrixTable, type ArticleItemData } from './articles-hub-matrix-table';
import { ArticlesHubCardList } from './articles-hub-card-list';
import { ArticlesHubFooter } from './articles-hub-footer';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockArticles: ArticleItemData[] = [
  {
    id: 'art-1',
    title: 'Designing Multi-Tenant Architecture on Kubernetes',
    slug: 'multi-tenant-k8s',
    status: 'READY',
    updatedAt: new Date('2026-09-30T10:00:00Z'),
    createdAt: new Date('2026-09-29T10:00:00Z'),
    words: 840,
    readingTimeMinutes: 4,
    tags: ['kubernetes', 'devops', 'architecture'],
    canonicalUrl: 'https://artxflow.dev/blog/multi-tenant-k8s',
    canonicalDomain: 'artxflow.dev',
    publications: [
      {
        destinationId: 'dest-1',
        destinationType: 'devto',
        status: 'PUBLISHED',
        externalUrl: 'https://dev.to/article/1',
      },
      {
        destinationId: 'dest-2',
        destinationType: 'hashnode',
        status: 'PUBLISHED',
        externalUrl: 'https://hashnode.com/article/1',
      },
    ],
    isScheduled: false,
  },
  {
    id: 'art-2',
    title: 'Zero-Trust Secrets Injection with Vault',
    slug: 'zero-trust-secrets',
    status: 'DRAFT',
    updatedAt: new Date('2026-09-30T12:00:00Z'),
    createdAt: new Date('2026-09-30T11:00:00Z'),
    words: 2100,
    readingTimeMinutes: 11,
    tags: ['security', 'vault'],
    canonicalUrl: 'https://artxflow.dev/blog/zero-trust-secrets',
    canonicalDomain: 'artxflow.dev',
    publications: [],
    isScheduled: false,
  },
  {
    id: 'art-3',
    title: 'Real-Time Telemetry with ClickHouse and Grafana',
    slug: 'clickhouse-telemetry',
    status: 'READY',
    updatedAt: new Date('2026-09-28T10:00:00Z'),
    createdAt: new Date('2026-09-27T10:00:00Z'),
    words: 1180,
    readingTimeMinutes: 6,
    tags: ['observability', 'clickhouse'],
    canonicalUrl: 'https://artxflow.dev/blog/clickhouse-telemetry',
    canonicalDomain: 'artxflow.dev',
    publications: [
      {
        destinationId: 'dest-3',
        destinationType: 'medium',
        status: 'FAILED',
        lastErrorMessage: 'Token expired',
      },
    ],
    isScheduled: false,
  },
];

describe('Articles & Syndication Hub Components', () => {
  describe('ArticlesHubHeader', () => {
    it('renders page title, primary repo badge, and action buttons', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubHeader
          selectedCount={0}
          onBatchSync={vi.fn()}
          onOpenImport={vi.fn()}
          isSyncingBatch={false}
        />,
      );

      expect(html).toContain('Articles &amp; Content Hub');
      expect(html).toContain('Primary Repo');
      expect(html).toContain('Batch Sync');
      expect(html).toContain('Import Markdown');
      expect(html).toContain('+ New Article');
    });

    it('shows selected count in Batch Sync button when articles selected', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubHeader
          selectedCount={3}
          onBatchSync={vi.fn()}
          onOpenImport={vi.fn()}
          isSyncingBatch={false}
        />,
      );

      expect(html).toContain('Batch Sync (3)');
    });
  });

  describe('ArticlesHubMetrics', () => {
    it('renders desktop and mobile metric decks with correct numbers', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubMetrics
          totalArticles={28}
          articlesThisWeek={3}
          syncedCount={22}
          syncedPercentage={94}
          draftCount={4}
          issuesCount={2}
        />,
      );

      expect(html).toContain('Total Canonical Articles');
      expect(html).toContain('28');
      expect(html).toContain('+3 this week');
      expect(html).toContain('Synced Across Platforms');
      expect(html).toContain('22');
      expect(html).toContain('94% delivery rate');
      expect(html).toContain('In Draft / Local Engine');
      expect(html).toContain('4');
      expect(html).toContain('Sync Divergence / Alerts');
      expect(html).toContain('Requires review');
    });

    it('renders all healthy state when issuesCount is 0', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubMetrics
          totalArticles={10}
          articlesThisWeek={2}
          syncedCount={10}
          syncedPercentage={100}
          draftCount={0}
          issuesCount={0}
        />,
      );

      expect(html).toContain('All healthy');
    });
  });

  describe('ArticlesHubFilterBar', () => {
    it('renders all filter tabs with badges and view mode toggles', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubFilterBar
          activeTab="all"
          onTabChange={vi.fn()}
          tabCounts={{ all: 28, published: 22, drafts: 4, scheduled: 2, issues: 2 }}
          searchQuery=""
          onSearchChange={vi.fn()}
          destinationFilter="all"
          onDestinationChange={vi.fn()}
          tagFilter="all"
          onTagChange={vi.fn()}
          availableTags={['kubernetes', 'ai', 'typescript']}
          sortField="updated"
          onSortChange={vi.fn()}
          viewMode="table"
          onViewModeChange={vi.fn()}
        />,
      );

      expect(html).toContain('All Articles');
      expect(html).toContain('Published &amp; Synced');
      expect(html).toContain('Drafts');
      expect(html).toContain('Scheduled');
      expect(html).toContain('Issues');
      expect(html).toContain('All Destinations');
      expect(html).toContain('#kubernetes');
      expect(html).toContain('#ai');
      expect(html).toContain('#typescript');
      expect(html).toContain('Sort: Updated');
    });
  });

  describe('ArticlesHubMatrixTable', () => {
    it('renders column headers and article rows correctly', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubMatrixTable
          articles={mockArticles}
          selectedIds={new Set(['art-1'])}
          onToggleSelect={vi.fn()}
          onToggleSelectAll={vi.fn()}
          onSyncArticle={vi.fn()}
          onDeleteArticle={vi.fn()}
        />,
      );

      expect(html).toContain('CANONICAL ARTICLE &amp; METADATA');
      expect(html).toContain('PRIMARY TARGET');
      expect(html).toContain('MULTI-PLATFORM SYNDICATION MATRIX');
      expect(html).toContain('ACTIONS');

      // Row 1
      expect(html).toContain('Designing Multi-Tenant Architecture on Kubernetes');
      expect(html).toContain('/multi-tenant-k8s');
      expect(html).toContain('840 words');
      expect(html).toContain('#kubernetes');
      expect(html).toContain('artxflow.dev');
      expect(html).toContain('DEV.to');
      expect(html).toContain('Hashnode');

      // Row 2 (Draft)
      expect(html).toContain('Zero-Trust Secrets Injection with Vault');
      expect(html).toContain('+ Bind Targets');

      // Row 3 (Diverged)
      expect(html).toContain('Real-Time Telemetry with ClickHouse and Grafana');
      expect(html).toContain('Diverged');
    });
  });

  describe('ArticlesHubCardList', () => {
    it('renders card items for mobile with syndication pills', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubCardList
          articles={mockArticles}
          onSyncArticle={vi.fn()}
          onDeleteArticle={vi.fn()}
        />,
      );

      expect(html).toContain('Designing Multi-Tenant Architecture on Kubernetes');
      expect(html).toContain('Published');
      expect(html).toContain('Local Draft');
      expect(html).toContain('Diverged');
      expect(html).toContain('Syndication Matrix');
      expect(html).toContain('Edit');
      expect(html).toContain('Sync');
    });
  });

  describe('ArticlesHubFooter', () => {
    it('renders live daemon status bar, pagination, and telemetry deck', () => {
      const html = renderToStaticMarkup(
        <ArticlesHubFooter
          totalArticles={28}
          currentPage={1}
          pageSize={10}
          onPageChange={vi.fn()}
          stagedDispatchesCount={2}
          failingJobsCount={0}
        />,
      );

      expect(html).toContain('Sync Engine Active');
      expect(html).toContain('0 jobs failing');
      expect(html).toContain('Showing');
      expect(html).toContain('1-10');
      expect(html).toContain('28');
      expect(html).toContain('Rate Limit Budget');
      expect(html).toContain('Staged Dispatches');
      expect(html).toContain('Canonical Engine');
    });
  });
});
