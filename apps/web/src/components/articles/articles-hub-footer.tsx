'use client';

import React from 'react';

export interface ArticlesHubFooterProps {
  totalArticles: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  stagedDispatchesCount: number;
  failingJobsCount?: number;
}

export function ArticlesHubFooter({
  totalArticles,
  currentPage,
  pageSize,
  onPageChange,
  stagedDispatchesCount,
  failingJobsCount = 0,
}: ArticlesHubFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalArticles / pageSize));
  const startItem = totalArticles === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalArticles, currentPage * pageSize);

  return (
    <footer style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '8px' }}>
      {/* 1. Live Daemon Status & Pagination Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: 'var(--surface-base, #070B12)',
          border: '1px solid var(--border-subtle, #172333)',
          fontSize: '12px',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* Daemon Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', position: 'relative', width: '8px', height: '8px' }}>
            <span
              style={{
                position: 'absolute',
                display: 'inline-flex',
                height: '100%',
                width: '100%',
                borderRadius: '999px',
                backgroundColor: failingJobsCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)',
                opacity: 0.75,
                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
              }}
            />
            <span
              style={{
                position: 'relative',
                display: 'inline-flex',
                borderRadius: '999px',
                height: '8px',
                width: '8px',
                backgroundColor: failingJobsCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)',
              }}
            />
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
            Sync Engine Active
          </span>
          <span style={{ color: 'var(--text-muted, #66768D)' }}>•</span>
          <span style={{ color: failingJobsCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)' }}>
            {failingJobsCount} jobs failing
          </span>
          <span style={{ color: 'var(--text-muted, #66768D)' }}>•</span>
          <span style={{ color: 'var(--text-muted, #66768D)' }}>Last global cycle 42s ago</span>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-muted, #66768D)' }}>
            Showing <strong style={{ color: 'var(--text-primary, #F5F7FA)' }}>{startItem}-{endItem}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary, #F5F7FA)' }}>{totalArticles}</strong>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Previous page"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-raised, #0D1420)',
                border: '1px solid var(--border-subtle, #172333)',
                color: currentPage <= 1 ? 'var(--text-muted, #66768D)' : 'var(--text-primary, #F5F7FA)',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage <= 1 ? 0.4 : 1,
              }}
            >
              ←
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const isActive = p === currentPage;
              if (totalPages > 5 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                return null;
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'var(--surface-container, #1B2027)' : 'var(--surface-raised, #0D1420)',
                    border: isActive ? '1px solid var(--flow-blue, #0B87FE)' : '1px solid var(--border-subtle, #172333)',
                    color: isActive ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Next page"
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-raised, #0D1420)',
                border: '1px solid var(--border-subtle, #172333)',
                color: currentPage >= totalPages ? 'var(--text-muted, #66768D)' : 'var(--text-primary, #F5F7FA)',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage >= totalPages ? 0.4 : 1,
              }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* 2. Telemetry & Staged Dispatches Bottom Deck */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
          width: '100%',
        }}
      >
        {/* Rate Limit Budget */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--flow-cyan, #19D7FE)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Rate Limit Budget
              </div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                DEV.to: 28/30 req • Hashnode: Unlimited
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              color: 'var(--status-success, #12B76A)',
              backgroundColor: 'rgba(18, 183, 106, 0.1)',
              border: '1px solid rgba(18, 183, 106, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            92% Healthy
          </span>
        </div>

        {/* Staged Dispatches */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Staged Dispatches
              </div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                {stagedDispatchesCount} articles queued in workflow
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              color: '#FBBF24',
              backgroundColor: 'rgba(69, 26, 3, 0.6)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {stagedDispatchesCount} Queued
          </span>
        </div>

        {/* Canonical Engine */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--flow-purple, #7A5CFD)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Canonical Engine
              </div>
              <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                Automatic rel=&quot;canonical&quot; header injection
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              color: 'var(--status-success, #12B76A)',
              backgroundColor: 'rgba(18, 183, 106, 0.1)',
              border: '1px solid rgba(18, 183, 106, 0.3)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            Active
          </span>
        </div>
      </section>
    </footer>
  );
}
