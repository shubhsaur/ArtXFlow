'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArticlesHubHeader } from './articles-hub-header';
import { ArticlesHubMetrics } from './articles-hub-metrics';
import {
  ArticlesHubFilterBar,
  type ArticleFilterTab,
  type ArticleViewMode,
  type ArticleSortField,
} from './articles-hub-filter-bar';
import { ArticlesHubMatrixTable, type ArticleItemData } from './articles-hub-matrix-table';
import { ArticlesHubCardList } from './articles-hub-card-list';
import { ArticlesHubFooter } from './articles-hub-footer';
import { ImportMarkdownModal } from './import-markdown-modal';

export interface ArticlesHubClientProps {
  initialArticles: ArticleItemData[];
  metrics: {
    totalArticles: number;
    articlesThisWeek: number;
    syncedCount: number;
    syncedPercentage: number;
    draftCount: number;
    issuesCount: number;
    stagedDispatchesCount: number;
  };
  availableTags: string[];
}

export function ArticlesHubClient({
  initialArticles,
  metrics,
  availableTags,
}: ArticlesHubClientProps) {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleItemData[]>(initialArticles);

  // Filters & Search state
  const [activeTab, setActiveTab] = useState<ArticleFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortField, setSortField] = useState<ArticleSortField>('updated');
  const [viewMode, setViewMode] = useState<ArticleViewMode>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selection & Actions state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [syncingArticleId, setSyncingArticleId] = useState<string | null>(null);
  const [isSyncingBatch, setIsSyncingBatch] = useState(false);

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<ArticleItemData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter tab counts
  const tabCounts = useMemo(() => {
    return {
      all: articles.length,
      published: articles.filter(
        (a) => a.status === 'READY' || a.publications.some((p) => p.status === 'PUBLISHED'),
      ).length,
      drafts: articles.filter((a) => a.status === 'DRAFT').length,
      scheduled: articles.filter((a) => Boolean(a.isScheduled)).length,
      issues: articles.filter((a) => a.publications.some((p) => p.status === 'FAILED')).length,
    };
  }, [articles]);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        // Tab filter
        if (activeTab === 'published') {
          const isPub = article.status === 'READY' || article.publications.some((p) => p.status === 'PUBLISHED');
          if (!isPub) return false;
        } else if (activeTab === 'drafts') {
          if (article.status !== 'DRAFT') return false;
        } else if (activeTab === 'scheduled') {
          if (!article.isScheduled) return false;
        } else if (activeTab === 'issues') {
          const hasIssue = article.publications.some((p) => p.status === 'FAILED');
          if (!hasIssue) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchesTitle = article.title.toLowerCase().includes(query);
          const matchesSlug = article.slug.toLowerCase().includes(query);
          const matchesTag = article.tags.some((t) => t.toLowerCase().includes(query));
          const matchesDomain = (article.canonicalDomain || '').toLowerCase().includes(query);
          if (!matchesTitle && !matchesSlug && !matchesTag && !matchesDomain) {
            return false;
          }
        }

        // Destination filter
        if (destinationFilter !== 'all') {
          const destMatch = article.publications.some(
            (p) => p.destinationType.toLowerCase() === destinationFilter.toLowerCase(),
          );
          if (!destMatch) return false;
        }

        // Tag filter
        if (tagFilter !== 'all') {
          if (!article.tags.includes(tagFilter)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'title') {
          return a.title.localeCompare(b.title);
        }
        if (sortField === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortField === 'words') {
          return b.words - a.words;
        }
        // Default: updated
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [articles, activeTab, searchQuery, destinationFilter, tagFilter, sortField]);

  // Paginated articles
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredArticles.slice(startIndex, startIndex + pageSize);
  }, [filteredArticles, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedArticles.length && paginatedArticles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedArticles.map((a) => a.id)));
    }
  };

  // Sync single article handler
  const handleSyncArticle = async (articleId: string) => {
    setSyncingArticleId(articleId);
    try {
      const res = await fetch(`/api/articles/${articleId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setSyncingArticleId(null);
    }
  };

  // Batch sync selected articles handler
  const handleBatchSync = async () => {
    if (selectedIds.size === 0) return;
    setIsSyncingBatch(true);

    try {
      const ids = Array.from(selectedIds);
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/articles/${id}/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => null),
        ),
      );
      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setIsSyncingBatch(false);
    }
  };

  // Delete article handler
  const handleConfirmDelete = async () => {
    if (!deletingArticle) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/articles/${deletingArticle.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deletingArticle.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deletingArticle.id);
          return next;
        });
        setDeletingArticle(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', minWidth: 0 }}>
      {/* 1. Page Title Header */}
      <ArticlesHubHeader
        selectedCount={selectedIds.size}
        onBatchSync={handleBatchSync}
        onOpenImport={() => setIsImportOpen(true)}
        isSyncingBatch={isSyncingBatch}
      />

      {/* 2. Summary Metrics Deck (Desktop 4-Grid, Mobile 2-Grid) */}
      <ArticlesHubMetrics
        totalArticles={metrics.totalArticles}
        articlesThisWeek={metrics.articlesThisWeek}
        syncedCount={metrics.syncedCount}
        syncedPercentage={metrics.syncedPercentage}
        draftCount={metrics.draftCount}
        issuesCount={metrics.issuesCount}
      />

      {/* 3. Filter & Search Controls Bar */}
      <ArticlesHubFilterBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        destinationFilter={destinationFilter}
        onDestinationChange={(dest) => {
          setDestinationFilter(dest);
          setCurrentPage(1);
        }}
        tagFilter={tagFilter}
        onTagChange={(tag) => {
          setTagFilter(tag);
          setCurrentPage(1);
        }}
        availableTags={availableTags}
        sortField={sortField}
        onSortChange={setSortField}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 4. Articles Data Display (Table on Desktop, Cards on Mobile or Card Mode) */}
      {paginatedArticles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-default, #243447)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--flow-cyan, #19D7FE)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: '0 0 6px' }}>
            {searchQuery || activeTab !== 'all' || destinationFilter !== 'all' || tagFilter !== 'all'
              ? 'No articles match the current filters'
              : 'No articles in your repository yet'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)', maxWidth: '420px', margin: '0 auto 20px' }}>
            {searchQuery || activeTab !== 'all' || destinationFilter !== 'all' || tagFilter !== 'all'
              ? 'Try adjusting your search criteria, clearing active filters, or switching tabs.'
              : 'Create your first canonical article or import an existing Markdown file to orchestrate multi-platform publication.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {searchQuery || activeTab !== 'all' || destinationFilter !== 'all' || tagFilter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                  setDestinationFilter('all');
                  setTagFilter('all');
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-container, #1B2027)',
                  border: '1px solid var(--border-default, #243447)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Reset All Filters
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-base, #070B12)',
                    border: '1px solid var(--border-default, #243447)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Import Markdown
                </button>
                <Link
                  href="/articles/new"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#0B62F5',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  + Create First Article
                </Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View (when in table mode and screen >= 1024px) */}
          {viewMode === 'table' ? (
            <>
              <div className="articles-desktop-view">
                <ArticlesHubMatrixTable
                  articles={paginatedArticles}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onSyncArticle={handleSyncArticle}
                  onDeleteArticle={setDeletingArticle}
                  syncingArticleId={syncingArticleId}
                />
              </div>
              <div className="articles-mobile-view">
                <ArticlesHubCardList
                  articles={paginatedArticles}
                  onSyncArticle={handleSyncArticle}
                  onDeleteArticle={setDeletingArticle}
                  syncingArticleId={syncingArticleId}
                />
              </div>
            </>
          ) : (
            /* Card Grid View (when user explicitly selected Grid mode) */
            <ArticlesHubCardList
              articles={paginatedArticles}
              onSyncArticle={handleSyncArticle}
              onDeleteArticle={setDeletingArticle}
              syncingArticleId={syncingArticleId}
            />
          )}

          {/* 5. Pagination & Live Sync Status Footer */}
          <ArticlesHubFooter
            totalArticles={filteredArticles.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            stagedDispatchesCount={metrics.stagedDispatchesCount}
            failingJobsCount={metrics.issuesCount}
          />
        </>
      )}

      {/* 6. Import Markdown Modal */}
      <ImportMarkdownModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      {/* 7. Delete Confirmation Modal */}
      {deletingArticle && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(217, 45, 32, 0.15)',
                  border: '1px solid rgba(217, 45, 32, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-error, #D92D20)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
                  Delete Article
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0' }}>
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '20px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary, #F5F7FA)' }}>{deletingArticle.title}</strong>? All versions, publication logs, and schedules tied to this article will be permanently removed.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default, #243447)',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--status-error, #D92D20)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
