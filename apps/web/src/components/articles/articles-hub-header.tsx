'use client';

import React from 'react';
import Link from 'next/link';

export interface ArticlesHubHeaderProps {
  selectedCount: number;
  onBatchSync: () => void;
  onOpenImport: () => void;
  isSyncingBatch?: boolean;
}

export function ArticlesHubHeader({
  selectedCount,
  onBatchSync,
  onOpenImport,
  isSyncingBatch = false,
}: ArticlesHubHeaderProps) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '24px',
              lineHeight: '30px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: 0,
            }}
          >
            Articles &amp; Content Hub
          </h1>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-container, #1B2027)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--flow-cyan, #19D7FE)',
            }}
          >
            Primary Repo
          </span>
        </div>
        <p
          style={{
            fontSize: '13px',
            lineHeight: '18px',
            color: 'var(--text-secondary, #AAB5C4)',
            marginTop: '4px',
            maxWidth: '680px',
          }}
        >
          Canonical content repository with multi-destination syndication matrix, live sync states, and adapter telemetry.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        {/* Batch Sync Button */}
        <button
          type="button"
          onClick={onBatchSync}
          disabled={selectedCount === 0 || isSyncingBatch}
          title={selectedCount === 0 ? 'Select articles to batch sync' : `Sync ${selectedCount} selected articles`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: selectedCount > 0 ? 'var(--surface-container, #1B2027)' : 'var(--surface-raised, #0D1420)',
            border: selectedCount > 0 ? '1px solid var(--flow-blue, #0B87FE)' : '1px solid var(--border-default, #243447)',
            color: selectedCount > 0 ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            cursor: selectedCount === 0 || isSyncingBatch ? 'not-allowed' : 'pointer',
            opacity: selectedCount === 0 ? 0.6 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: isSyncingBatch ? 'spin 1s linear infinite' : 'none' }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{isSyncingBatch ? 'Syncing...' : selectedCount > 0 ? `Batch Sync (${selectedCount})` : 'Batch Sync'}</span>
        </button>

        {/* Import Markdown Button */}
        <button
          type="button"
          onClick={onOpenImport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            color: 'var(--text-primary, #F5F7FA)',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-secondary, #AAB5C4)' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Import Markdown</span>
        </button>

        {/* Primary CTA: + New Article */}
        <Link
          href="/articles/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#0B62F5',
            backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.12) 100%)',
            boxShadow: '0 2px 8px rgba(11, 98, 245, 0.35)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            letterSpacing: '0.01em',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>+ New Article</span>
        </Link>
      </div>
    </section>
  );
}
