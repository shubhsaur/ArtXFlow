'use client';

import React from 'react';

export interface EditorMobileDockProps {
  slug: string;
  wordCount: number;
  readingTimeMinutes: number;
  activeTab: 'write' | 'preview' | 'media' | 'inspect';
  onSelectTab: (tab: 'write' | 'preview' | 'media' | 'inspect') => void;
}

export function EditorMobileDock({
  slug,
  wordCount,
  readingTimeMinutes,
  activeTab,
  onSelectTab,
}: EditorMobileDockProps) {
  const displaySlug = `artxflow.dev/blog/${slug || 'article'}`;

  return (
    <footer
      className="header-mobile-toggle"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(13, 20, 32, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle, #172333)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Telemetry Status Hairline Strip */}
      <div
        style={{
          height: '24px',
          padding: '0 12px',
          backgroundColor: 'var(--surface-base, #070B12)',
          borderBottom: '1px solid var(--border-subtle, #172333)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--text-muted, #66768D)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--flow-cyan, #19D7FE)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span style={{ color: 'var(--flow-cyan, #19D7FE)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displaySlug}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{readingTimeMinutes} min read</span>
        </div>
      </div>

      {/* Bottom Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '52px',
          padding: '0 8px',
        }}
      >
        {/* Write */}
        <button
          type="button"
          onClick={() => onSelectTab('write')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: activeTab === 'write' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            border: activeTab === 'write' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '4px 14px',
            color: activeTab === 'write' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Write</span>
        </button>

        {/* Preview */}
        <button
          type="button"
          onClick={() => onSelectTab('preview')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: activeTab === 'preview' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            border: activeTab === 'preview' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '4px 14px',
            color: activeTab === 'preview' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Preview</span>
        </button>

        {/* Media */}
        <button
          type="button"
          onClick={() => onSelectTab('media')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: activeTab === 'media' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            border: activeTab === 'media' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '4px 14px',
            color: activeTab === 'media' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Media</span>
        </button>

        {/* Inspect */}
        <button
          type="button"
          onClick={() => onSelectTab('inspect')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: activeTab === 'inspect' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            border: activeTab === 'inspect' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            borderRadius: '8px',
            padding: '4px 14px',
            color: activeTab === 'inspect' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>Inspect</span>
        </button>
      </div>
    </footer>
  );
}
