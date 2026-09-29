'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@artxflow/ui';

export interface EditorHeaderProps {
  title: string;
  saveStatus: 'idle' | 'saved' | 'unsaved' | 'saving' | 'error';
  lastSavedAt?: Date | null;
  activeDestinationsCount?: number;
  activePlatforms?: Array<{ id: string; name: string; tag: string }>;
  isPublishing?: boolean;
  isSaving?: boolean;
  onSaveDraft: () => void;
  onOpenHistory: () => void;
  onOpenOverrides: () => void;
  onPublishClick: () => void;
  mode: 'create' | 'edit';
  staleExtensionUpdatesCount?: number;
  onUpdatePublishedCopies?: () => void;
}

export function EditorHeader({
  title,
  saveStatus,
  lastSavedAt,
  activeDestinationsCount = 3,
  activePlatforms = [
    { id: 'devto', name: 'DEV.to', tag: 'DEV' },
    { id: 'hashnode', name: 'Hashnode', tag: 'HASH' },
    { id: 'medium', name: 'Medium', tag: 'MED' },
  ],
  isPublishing = false,
  isSaving = false,
  onSaveDraft,
  onOpenHistory,
  onOpenOverrides,
  onPublishClick,
  mode,
  staleExtensionUpdatesCount = 0,
  onUpdatePublishedCopies,
}: EditorHeaderProps) {
  const getRelativeSavedTime = () => {
    if (!lastSavedAt) return 'just now';
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <header
      role="banner"
      style={{
        height: '56px',
        backgroundColor: 'var(--surface-raised, #0D1420)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(12px, 2vw, 24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Cluster: Logo, Breadcrumbs, Autosave Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1, marginRight: '16px' }}>
        {/* Mobile Back Button */}
        <Link
          href="/articles"
          className="header-mobile-toggle"
          aria-label="Back to Articles"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            color: 'var(--text-secondary, #AAB5C4)',
            textDecoration: 'none',
            backgroundColor: 'transparent',
            flexShrink: 0,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>

        {/* Brand Logo & Version Pill */}
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}
          aria-label="ArtXFlow Home"
        >
          <Logo size={24} showWordmark={true} />
          <span
            className="app-header-brand-meta"
            style={{
              fontSize: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 5px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-overlay, #111A28)',
              color: 'var(--flow-cyan, #19D7FE)',
              border: '1px solid var(--border-default, #243447)',
              fontWeight: 600,
            }}
          >
            v2.4
          </span>
        </Link>

        {/* Desktop Divider */}
        <div
          className="app-header-brand-meta"
          style={{
            height: '16px',
            width: '1px',
            backgroundColor: 'var(--border-subtle, #172333)',
            flexShrink: 0,
          }}
        />

        {/* Breadcrumb Path */}
        <div
          className="app-header-brand-meta"
          style={{
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-muted, #66768D)',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <Link
            href="/articles"
            style={{
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            Articles
          </Link>
          <span style={{ color: 'var(--border-default, #243447)', flexShrink: 0 }}>/</span>
          <span
            style={{
              color: 'var(--text-primary, #F5F7FA)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '320px',
            }}
          >
            {title.trim() ? title : 'Untitled Article'}
          </span>
        </div>

        {/* Autosave Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 9px',
            borderRadius: '9999px',
            backgroundColor: 'var(--surface-container-low, #181C23)',
            border: '1px solid var(--border-subtle, #172333)',
            fontSize: '11px',
            color: 'var(--text-muted, #66768D)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor:
                saveStatus === 'error'
                  ? 'var(--status-error, #D92D20)'
                  : saveStatus === 'unsaved' || saveStatus === 'saving'
                    ? 'var(--status-warning, #F59E0B)'
                    : 'var(--status-success, #12B76A)',
              boxShadow:
                saveStatus === 'saving'
                  ? '0 0 8px var(--status-warning, #F59E0B)'
                  : saveStatus === 'saved' || saveStatus === 'idle'
                    ? '0 0 6px rgba(18, 183, 106, 0.4)'
                    : 'none',
            }}
          />
          <span style={{ color: 'var(--text-secondary, #AAB5C4)', fontWeight: 500 }}>
            {mode === 'create' ? 'Draft' : 'v' + (mode === 'edit' ? '1' : '')}
          </span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'unsaved'
                ? 'Unsaved changes'
                : saveStatus === 'error'
                  ? 'Save error'
                  : `Autosaved ${getRelativeSavedTime()}`}
          </span>
        </div>
      </div>

      {/* Right Cluster: Targets + Utility Actions + Publish CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Active Targets Pill (Desktop) */}
        <div
          className="header-desktop-auth"
          style={{
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-container-lowest, #090E15)',
            border: '1px solid var(--border-subtle, #172333)',
            padding: '4px 10px',
            borderRadius: '8px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
              {activeDestinationsCount} Targets
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid var(--border-subtle, #172333)', paddingLeft: '8px' }}>
            {activePlatforms.map((p) => {
              const isDev = p.tag === 'DEV';
              const isHash = p.tag === 'HASH';
              return (
                <span
                  key={p.id}
                  style={{
                    fontSize: '10px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--surface-raised, #0D1420)',
                    border: '1px solid',
                    borderColor: isDev
                      ? 'rgba(18, 183, 106, 0.4)'
                      : isHash
                        ? 'var(--flow-blue, #0B87FE)'
                        : 'var(--border-default, #243447)',
                    color: isDev
                      ? 'var(--status-success, #12B76A)'
                      : isHash
                        ? 'var(--flow-cyan, #19D7FE)'
                        : 'var(--text-muted, #66768D)',
                  }}
                >
                  {p.tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Utility Buttons (Desktop & Tablet) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            title="Save Draft (Ctrl+S / Cmd+S)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="app-header-brand-meta">Save Draft</span>
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            title="Version History"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 14 14" />
            </svg>
            <span className="app-header-brand-meta">History</span>
          </button>

          <button
            type="button"
            onClick={onOpenOverrides}
            title="Platform Overrides & Settings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="app-header-brand-meta">Overrides</span>
          </button>
        </div>

        {/* Stale Extension Updates CTA */}
        {staleExtensionUpdatesCount > 0 && onUpdatePublishedCopies && (
          <button
            type="button"
            onClick={onUpdatePublishedCopies}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-default, #243447)',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              color: 'var(--flow-cyan, #19D7FE)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>↻ Update Live</span>
          </button>
        )}

        <div className="app-header-brand-meta" style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-subtle, #172333)' }} />

        {/* Primary Action Publish CTA Button */}
        <button
          type="button"
          onClick={onPublishClick}
          disabled={isPublishing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--primary, #0B62F5)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 16px -2px rgba(11, 98, 245, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
          </svg>
          <span>{mode === 'create' ? 'Create Article' : 'Publish Article'}</span>
        </button>
      </div>
    </header>
  );
}
