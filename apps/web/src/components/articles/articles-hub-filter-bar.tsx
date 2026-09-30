'use client';

import React from 'react';

export type ArticleFilterTab = 'all' | 'published' | 'drafts' | 'scheduled' | 'issues';
export type ArticleViewMode = 'table' | 'grid';
export type ArticleSortField = 'updated' | 'created' | 'title' | 'words';

export interface ArticlesHubFilterBarProps {
  activeTab: ArticleFilterTab;
  onTabChange: (tab: ArticleFilterTab) => void;
  tabCounts: {
    all: number;
    published: number;
    drafts: number;
    scheduled: number;
    issues: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  destinationFilter: string;
  onDestinationChange: (dest: string) => void;
  tagFilter: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  sortField: ArticleSortField;
  onSortChange: (sort: ArticleSortField) => void;
  viewMode: ArticleViewMode;
  onViewModeChange: (mode: ArticleViewMode) => void;
}

export function ArticlesHubFilterBar({
  activeTab,
  onTabChange,
  tabCounts,
  searchQuery,
  onSearchChange,
  destinationFilter,
  onDestinationChange,
  tagFilter,
  onTagChange,
  availableTags,
  sortField,
  onSortChange,
  viewMode,
  onViewModeChange,
}: ArticlesHubFilterBarProps) {
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut for ⌘K / Ctrl+K search focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, width: '100%' }}>
      {/* 1. Status Filter Tab Pills & View Mode Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle, #172333)',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 'max-content' }}>
          {/* All */}
          <button
            type="button"
            onClick={() => onTabChange('all')}
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: activeTab === 'all' ? 600 : 500,
              color: activeTab === 'all' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              borderBottom: activeTab === 'all' ? '2px solid var(--flow-cyan, #19D7FE)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>All Articles</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-container, #1B2027)',
                color: activeTab === 'all' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              }}
            >
              {tabCounts.all}
            </span>
          </button>

          {/* Published & Synced */}
          <button
            type="button"
            onClick={() => onTabChange('published')}
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: activeTab === 'published' ? 600 : 500,
              color: activeTab === 'published' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              borderBottom: activeTab === 'published' ? '2px solid var(--flow-cyan, #19D7FE)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Published &amp; Synced</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-container, #1B2027)',
                color: activeTab === 'published' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              }}
            >
              {tabCounts.published}
            </span>
          </button>

          {/* Drafts */}
          <button
            type="button"
            onClick={() => onTabChange('drafts')}
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: activeTab === 'drafts' ? 600 : 500,
              color: activeTab === 'drafts' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              borderBottom: activeTab === 'drafts' ? '2px solid var(--flow-cyan, #19D7FE)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Drafts</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-container, #1B2027)',
                color: activeTab === 'drafts' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              }}
            >
              {tabCounts.drafts}
            </span>
          </button>

          {/* Scheduled */}
          <button
            type="button"
            onClick={() => onTabChange('scheduled')}
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: activeTab === 'scheduled' ? 600 : 500,
              color: activeTab === 'scheduled' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              borderBottom: activeTab === 'scheduled' ? '2px solid var(--flow-cyan, #19D7FE)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Scheduled</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-container, #1B2027)',
                color: activeTab === 'scheduled' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              }}
            >
              {tabCounts.scheduled}
            </span>
          </button>

          {/* Issues */}
          <button
            type="button"
            onClick={() => onTabChange('issues')}
            style={{
              paddingBottom: '10px',
              fontSize: '13px',
              fontWeight: activeTab === 'issues' ? 600 : 500,
              color: activeTab === 'issues' ? 'var(--status-error, #D92D20)' : 'var(--text-muted, #66768D)',
              borderBottom: activeTab === 'issues' ? '2px solid var(--status-error, #D92D20)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Issues</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(217, 45, 32, 0.15)',
                color: 'var(--status-error, #D92D20)',
                fontWeight: 600,
              }}
            >
              {tabCounts.issues}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Table Matrix vs Grid */}
        <div
          className="articles-desktop-view"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--surface-base, #070B12)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle, #172333)',
            marginBottom: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            title="Matrix Table View"
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'table' ? 'var(--surface-container, #1B2027)' : 'transparent',
              color: viewMode === 'table' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18M3 15h18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Card Grid View"
            style={{
              padding: '4px 6px',
              borderRadius: '6px',
              backgroundColor: viewMode === 'grid' ? 'var(--surface-container, #1B2027)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Search & Filters Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          padding: '10px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle, #172333)',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
          <span
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted, #66768D)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter by title, tag, or slug..."
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              borderRadius: '8px',
              padding: '7px 60px 7px 32px',
              fontSize: '13px',
              color: 'var(--text-primary, #F5F7FA)',
              outline: 'none',
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              title="Clear search"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #66768D)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <kbd
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: 'var(--text-muted, #66768D)',
                backgroundColor: 'var(--surface-container, #1B2027)',
                border: '1px solid var(--border-subtle, #172333)',
                borderRadius: '4px',
                padding: '2px 5px',
              }}
            >
              ⌘K
            </kbd>
          )}
        </div>

        {/* Destination Filter */}
        <div style={{ minWidth: '160px', flex: '0 1 auto' }}>
          <select
            value={destinationFilter}
            onChange={(e) => onDestinationChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '13px',
              color: destinationFilter === 'all' ? 'var(--text-secondary, #AAB5C4)' : 'var(--flow-cyan, #19D7FE)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Destinations</option>
            <option value="devto">DEV.to</option>
            <option value="hashnode">Hashnode</option>
            <option value="medium">Medium</option>
            <option value="substack">Substack</option>
            <option value="site">Hosted Blog</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div style={{ minWidth: '140px', flex: '0 1 auto' }}>
          <select
            value={tagFilter}
            onChange={(e) => onTagChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '13px',
              color: tagFilter === 'all' ? 'var(--text-secondary, #AAB5C4)' : 'var(--flow-cyan, #19D7FE)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div style={{ minWidth: '140px', flex: '0 1 auto' }}>
          <select
            value={sortField}
            onChange={(e) => onSortChange(e.target.value as ArticleSortField)}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              borderRadius: '8px',
              padding: '7px 10px',
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="updated">Sort: Updated</option>
            <option value="created">Sort: Created</option>
            <option value="title">Sort: Title</option>
            <option value="words">Sort: Length</option>
          </select>
        </div>
      </div>
    </section>
  );
}
