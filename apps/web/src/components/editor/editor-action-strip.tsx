'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface EditorActionStripProps {
  onApplyHeading: (level: 1 | 2 | 3 | 0) => void;
  onApplyInline: (prefix: string, suffix?: string, placeholder?: string) => void;
  onApplyBlockquote: () => void;
  onApplyList: (type: 'bullet' | 'number') => void;
  onApplyCodeBlock: (lang?: string) => void;
  onApplyDivider: () => void;
  onApplyTable: () => void;
  onApplyCalloutTip: () => void;
  onOpenLinkModal: () => void;
  onUploadImageClick: () => void;
  onOpenUnsplashModal: () => void;
  onOpenAiGenerate: () => void;
  coverUrl?: string | null;
  onOpenCoverSelect: () => void;
  onRemoveCover: () => void;
  isUploadingImage?: boolean;
  activeView: 'write' | 'preview';
  onChangeView: (view: 'write' | 'preview') => void;
  activePreviewPlatformName?: string;
}

export function EditorActionStrip({
  onApplyHeading,
  onApplyInline,
  onApplyBlockquote,
  onApplyList,
  onApplyCodeBlock,
  onApplyDivider: _onApplyDivider,
  onApplyTable,
  onApplyCalloutTip,
  onOpenLinkModal,
  onUploadImageClick,
  onOpenUnsplashModal,
  onOpenAiGenerate,
  coverUrl,
  onOpenCoverSelect,
  onRemoveCover,
  isUploadingImage = false,
  activeView,
  onChangeView,
  activePreviewPlatformName = 'DEV.to',
}: EditorActionStripProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const headingMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
        setShowHeadingMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section
      style={{
        backgroundColor: 'var(--surface-raised, #0D1420)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        padding: '8px clamp(12px, 2vw, 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0,
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    >
      {/* Top Action Row: Media Insert & Cover Slot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Left: Media Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onUploadImageClick}
            disabled={isUploadingImage}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-overlay, #111A28)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>{isUploadingImage ? 'Uploading...' : 'Upload Image'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenUnsplashModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-overlay, #111A28)',
              border: '1px solid rgba(25, 215, 254, 0.5)',
              color: 'var(--flow-cyan, #19D7FE)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 0 12px -3px rgba(25, 215, 254, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>Unsplash Library</span>
            <span
              style={{
                fontSize: '10px',
                fontFamily: "'JetBrains Mono', monospace",
                padding: '1px 5px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(25, 215, 254, 0.2)',
                color: 'var(--flow-cyan, #19D7FE)',
              }}
            >
              Active
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenAiGenerate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-container-low, #181C23)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--flow-purple, #7A5CFD)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <span>Generate with AI</span>
          </button>
        </div>

        {/* Right: Quick Cover Image Banner Slot */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {coverUrl ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-container-lowest, #090E15)',
                border: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '20px',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  backgroundColor: '#1E2638',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary, #AAB5C4)' }}>
                1200 × 630
              </span>
              <button
                type="button"
                onClick={onRemoveCover}
                title="Remove cover"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #66768D)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: '14px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenCoverSelect}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-container-lowest, #090E15)',
                border: '1px dashed var(--border-default, #243447)',
                color: 'var(--text-muted, #66768D)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              <span>+ Add Cover Image (1200×630)</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Mode Switcher (Visible on < 768px) */}
      <div
        className="header-mobile-toggle"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: '2px',
          backgroundColor: 'var(--surface-base, #070B12)',
          borderRadius: '8px',
          border: '1px solid var(--border-default, #243447)',
          marginTop: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => onChangeView('write')}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: activeView === 'write' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            backgroundColor: activeView === 'write' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            color: activeView === 'write' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
            fontSize: '13px',
            fontWeight: activeView === 'write' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>Editor</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeView('preview')}
          style={{
            padding: '6px',
            borderRadius: '6px',
            border: activeView === 'preview' ? '1px solid rgba(25, 215, 254, 0.4)' : '1px solid transparent',
            backgroundColor: activeView === 'preview' ? 'var(--surface-overlay, #111A28)' : 'transparent',
            color: activeView === 'preview' ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
            fontSize: '13px',
            fontWeight: activeView === 'preview' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Live Preview ({activePreviewPlatformName})</span>
        </button>
      </div>

      {/* Dev.to-style Markdown Formatting Toolbar */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '4px',
          borderTop: '1px solid rgba(23, 35, 51, 0.7)',
          overflowX: 'auto',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          {/* Bold */}
          <button
            type="button"
            onClick={() => onApplyInline('**', '**', 'bold text')}
            title="Bold (Ctrl+B)"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            B
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => onApplyInline('*', '*', 'italic text')}
            title="Italic (Ctrl+I)"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontStyle: 'italic',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            I
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => onApplyInline('~~', '~~', 'strikethrough')}
            title="Strikethrough"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'line-through',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            S
          </button>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle, #172333)', margin: '0 4px' }} />

          {/* Headings dropdown */}
          <div ref={headingMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowHeadingMenu((prev) => !prev)}
              title="Headings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary, #AAB5C4)',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>H1 / H2 / H3</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
            </button>

            {showHeadingMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--surface-overlay, #111A28)',
                  border: '1px solid var(--border-default, #243447)',
                  borderRadius: '6px',
                  padding: '4px',
                  zIndex: 60,
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '120px',
                }}
              >
                <button
                  type="button"
                  onClick={() => { onApplyHeading(1); setShowHeadingMenu(false); }}
                  style={{ padding: '6px 10px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary, #F5F7FA)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
                >
                  Heading 1
                </button>
                <button
                  type="button"
                  onClick={() => { onApplyHeading(2); setShowHeadingMenu(false); }}
                  style={{ padding: '6px 10px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary, #F5F7FA)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
                >
                  Heading 2
                </button>
                <button
                  type="button"
                  onClick={() => { onApplyHeading(3); setShowHeadingMenu(false); }}
                  style={{ padding: '6px 10px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary, #F5F7FA)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '4px' }}
                >
                  Heading 3
                </button>
              </div>
            )}
          </div>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle, #172333)', margin: '0 4px' }} />

          {/* Quote */}
          <button
            type="button"
            onClick={onApplyBlockquote}
            title="Blockquote"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '15px',
              fontFamily: 'serif',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            &ldquo;
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onClick={() => onApplyInline('`', '`', 'code')}
            title="Inline Code"
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
            }}
          >
            &lt;&gt;
          </button>

          {/* Code Block */}
          <button
            type="button"
            onClick={() => onApplyCodeBlock('typescript')}
            title="Code Block"
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
            }}
          >
            {'{ }'}
          </button>

          <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border-subtle, #172333)', margin: '0 4px' }} />

          {/* Link */}
          <button
            type="button"
            onClick={onOpenLinkModal}
            title="Insert Link"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          </button>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => onApplyList('bullet')}
            title="Bullet List"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => onApplyList('number')}
            title="Numbered List"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={onApplyTable}
            title="Table"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /><path d="M9 3v18" /><path d="M15 3v18" /></svg>
          </button>

          {/* Callout Tip */}
          <button
            type="button"
            onClick={onApplyCalloutTip}
            title="Architectural Callout Tip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: 'var(--secondary-foreground, #F59E0B)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>💡</span>
            <span>Tip</span>
          </button>
        </div>

        {/* Right Status (Desktop) */}
        <div className="app-header-brand-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)', flexShrink: 0 }}>
          <span>Markdown Mode</span>
          <span style={{ color: 'var(--border-default, #243447)' }}>·</span>
          <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Sync Active</span>
        </div>
      </div>
    </section>
  );
}
