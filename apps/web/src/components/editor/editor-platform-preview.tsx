'use client';

import React from 'react';
import { ArticleRenderer } from '@artxflow/ui';

export interface EditorPlatformPreviewProps {
  title: string;
  content: string;
  coverUrl?: string | null;
  tags: string[];
  slug: string;
  canonicalUrl?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
  authorRole?: string | null;
  selectedPlatform: 'devto' | 'hashnode' | 'medium';
  onSelectPlatform: (platform: 'devto' | 'hashnode' | 'medium') => void;
}

export function EditorPlatformPreview({
  title,
  content,
  coverUrl,
  tags = [],
  slug,
  canonicalUrl,
  authorName = 'Engineering Lead',
  authorImage,
  authorRole = 'Staff Infra',
  selectedPlatform,
  onSelectPlatform,
}: EditorPlatformPreviewProps) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const displayCanonical = canonicalUrl || `https://artxflow.dev/blog/${slug || 'article'}`;

  // Platform specific styling container
  const getPlatformCardStyle = (): React.CSSProperties => {
    switch (selectedPlatform) {
      case 'medium':
        return {
          fontFamily: "Newsreader, Georgia, Cambria, 'Times New Roman', Times, serif",
          backgroundColor: '#0B0F17',
          borderColor: '#1E2638',
        };
      case 'hashnode':
        return {
          backgroundColor: '#0D1117',
          borderColor: '#30363D',
        };
      case 'devto':
      default:
        return {
          backgroundColor: 'var(--surface-raised, #0D1420)',
          borderColor: 'var(--border-default, #243447)',
        };
    }
  };

  const getAuthorInitials = () => {
    if (!authorName) return 'AX';
    const parts = authorName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--surface-container-lowest, #090E15)',
        borderLeft: '1px solid var(--border-subtle, #172333)',
        overflow: 'hidden',
      }}
    >
      {/* Top Preview Header Bar */}
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          borderBottom: '1px solid var(--border-subtle, #172333)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Platform Tabs & Canonical Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'var(--surface-container-low, #181C23)',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            {/* DEV.to */}
            <button
              type="button"
              onClick={() => onSelectPlatform('devto')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: selectedPlatform === 'devto' ? 600 : 500,
                backgroundColor: selectedPlatform === 'devto' ? 'var(--surface-overlay, #111A28)' : 'transparent',
                color: selectedPlatform === 'devto' ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                border: selectedPlatform === 'devto' ? '1px solid var(--flow-blue, #0B87FE)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--surface-raised, #0D1420)',
                  color: 'var(--status-success, #12B76A)',
                  border: '1px solid rgba(18, 183, 106, 0.4)',
                }}
              >
                DEV
              </span>
              <span>DEV.to</span>
            </button>

            {/* Hashnode */}
            <button
              type="button"
              onClick={() => onSelectPlatform('hashnode')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: selectedPlatform === 'hashnode' ? 600 : 500,
                backgroundColor: selectedPlatform === 'hashnode' ? 'var(--surface-overlay, #111A28)' : 'transparent',
                color: selectedPlatform === 'hashnode' ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                border: selectedPlatform === 'hashnode' ? '1px solid var(--flow-blue, #0B87FE)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--surface-raised, #0D1420)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  border: '1px solid rgba(11, 135, 254, 0.4)',
                }}
              >
                HASH
              </span>
              <span>Hashnode</span>
            </button>

            {/* Medium */}
            <button
              type="button"
              onClick={() => onSelectPlatform('medium')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: selectedPlatform === 'medium' ? 600 : 500,
                backgroundColor: selectedPlatform === 'medium' ? 'var(--surface-overlay, #111A28)' : 'transparent',
                color: selectedPlatform === 'medium' ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                border: selectedPlatform === 'medium' ? '1px solid var(--flow-blue, #0B87FE)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: '9px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  padding: '1px 4px',
                  borderRadius: '3px',
                  backgroundColor: 'var(--surface-raised, #0D1420)',
                  color: 'var(--text-muted, #66768D)',
                  border: '1px solid var(--border-default, #243447)',
                }}
              >
                MED
              </span>
              <span>Medium</span>
            </button>
          </div>

          {/* Canonical Link Pill */}
          <div
            className="app-header-brand-meta"
            style={{
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-container-low, #181C23)',
              border: '1px solid var(--border-subtle, #172333)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted, #66768D)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--flow-cyan, #19D7FE)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
            <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayCanonical.replace(/^https?:\/\//, '')}
            </span>
          </div>
        </div>

        {/* Right: Live Preview Pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(18, 183, 106, 0.1)',
              border: '1px solid rgba(18, 183, 106, 0.3)',
              fontSize: '11px',
              color: 'var(--status-success, #12B76A)',
              fontWeight: 500,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)', boxShadow: '0 0 6px rgba(18, 183, 106, 0.6)' }} />
            <span>Live Preview</span>
          </div>
        </div>
      </div>

      {/* Preview Content Canvas */}
      <div
        className="custom-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(16px, 3vw, 28px)',
          backgroundColor: 'var(--surface-base, #070B12)',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            borderRadius: '12px',
            border: '1px solid',
            overflow: 'hidden',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
            ...getPlatformCardStyle(),
          }}
        >
          {/* Cover Image Banner */}
          {coverUrl && (
            <div style={{ width: '100%', height: '220px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--surface-container-high, #252A32)', borderBottom: '1px solid var(--border-subtle, #172333)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt={title || 'Cover'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(7, 11, 18, 0.85)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid var(--border-subtle, #172333)',
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                1200 × 630
              </div>
            </div>
          )}

          {/* Article Container */}
          <div style={{ padding: 'clamp(20px, 3vw, 32px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Author Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar with gradient border */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: 'linear-gradient(135deg, var(--flow-blue, #0B87FE), var(--flow-purple, #7A5CFD))',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      backgroundColor: 'var(--surface-overlay, #111A28)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: 'var(--flow-cyan, #19D7FE)',
                    }}
                  >
                    {authorImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={authorImage} alt={authorName || 'Author'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getAuthorInitials()
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                      {authorName || 'Author'}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(25, 215, 254, 0.1)',
                        color: 'var(--flow-cyan, #19D7FE)',
                        border: '1px solid rgba(25, 215, 254, 0.3)',
                      }}
                    >
                      {authorRole || 'Owner'}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                    Published just now · {readingTime} min read
                  </span>
                </div>
              </div>

              {/* Utility Reaction Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  title="Bookmark"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle, #172333)',
                    backgroundColor: 'var(--surface-container-low, #181C23)',
                    color: 'var(--text-secondary, #AAB5C4)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                </button>
                <button
                  type="button"
                  title="Share"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle, #172333)',
                    backgroundColor: 'var(--surface-container-low, #181C23)',
                    color: 'var(--text-secondary, #AAB5C4)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                </button>
              </div>
            </div>

            {/* Tags Row */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-container-low, #181C23)',
                      border: '1px solid var(--border-subtle, #172333)',
                      color: 'var(--flow-cyan, #19D7FE)',
                    }}
                  >
                    #{t.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}

            {/* Article Title */}
            <h1
              style={{
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                lineHeight: 1.25,
                color: 'var(--text-primary, #F5F7FA)',
                margin: 0,
              }}
            >
              {title.trim() ? title : 'Untitled Article'}
            </h1>

            {/* Article Content Rendered via Markdown */}
            <div
              style={{
                fontSize: '14px',
                lineHeight: 1.7,
                color: 'var(--text-secondary, #AAB5C4)',
                borderTop: '1px solid var(--border-subtle, #172333)',
                paddingTop: '20px',
              }}
            >
              {content.trim() ? (
                <ArticleRenderer content={content} />
              ) : (
                <p style={{ color: 'var(--text-muted, #66768D)', fontStyle: 'italic' }}>
                  Write something on the left pane to preview live platform rendering...
                </p>
              )}
            </div>

            {/* Footer Canonical URL Injected & Reactions */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--text-muted, #66768D)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: 'var(--status-success, #12B76A)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <span>Canonical URL injected</span>
              </div>

              {/* Simulated Social Reactions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  <span style={{ color: 'var(--status-error, #D92D20)' }}>❤️</span> 42
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  <span style={{ color: 'var(--flow-purple, #7A5CFD)' }}>✨</span> 18
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>🔖</span> 27
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
