'use client';

import React, { useState } from 'react';
import { ArticleRenderer } from './article-renderer';
import { Badge } from './badge';
import { Avatar } from './avatar';

export type ArticlePreviewMode = 'canonical' | 'devto' | 'medium' | 'hashnode';

export interface ArticlePreviewAuthor {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ArticlePreviewProps {
  title?: string;
  subtitle?: string;
  content: string;
  coverImageUrl?: string | null;
  tags?: string[];
  canonicalUrl?: string | null;
  author?: ArticlePreviewAuthor | null;
  publishedAt?: Date | string | null;
  readingTimeMinutes?: number;
  viewMode?: ArticlePreviewMode;
  onViewModeChange?: (mode: ArticlePreviewMode) => void;
  showModeSelector?: boolean;
  className?: string;
}

const platformNames: Record<ArticlePreviewMode, string> = {
  canonical: 'Canonical',
  devto: 'DEV.to',
  medium: 'Medium',
  hashnode: 'Hashnode',
};

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Draft';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Draft';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const ArticlePreview: React.FC<ArticlePreviewProps> = ({
  title,
  subtitle,
  content,
  coverImageUrl,
  tags = [],
  canonicalUrl,
  author,
  publishedAt,
  readingTimeMinutes,
  viewMode: controlledMode,
  onViewModeChange,
  showModeSelector = true,
  className = '',
}) => {
  const [internalMode, setInternalMode] = useState<ArticlePreviewMode>('canonical');
  const activeMode = controlledMode ?? internalMode;

  const handleModeChange = (mode: ArticlePreviewMode) => {
    setInternalMode(mode);
    onViewModeChange?.(mode);
  };

  const readingTime = readingTimeMinutes ?? calculateReadingTime(content);
  const formattedDate = formatDate(publishedAt);

  // Platform projection container styling
  const getContainerStyle = (): React.CSSProperties => {
    switch (activeMode) {
      case 'devto':
        return {
          background: '#090909',
          border: '1px solid #242424',
          borderRadius: '7px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        };
      case 'medium':
        return {
          background: '#0B0F17',
          border: '1px solid #1E2638',
          borderRadius: '12px',
          padding: '40px 32px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        };
      case 'hashnode':
        return {
          background: '#0D1117',
          border: '1px solid #30363D',
          borderRadius: '10px',
          padding: '36px',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)',
        };
      case 'canonical':
      default:
        return {
          background: 'var(--surface, #0D1420)',
          border: '1px solid var(--border, #1C2A3A)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '36px',
          boxShadow: 'var(--shadows-md, 0 4px 6px -1px rgba(16, 24, 40, 0.1))',
        };
    }
  };

  return (
    <div className={`axf-article-preview-wrapper ${className}`} style={{ width: '100%' }}>
      {showModeSelector && (
        <div
          className="axf-preview-mode-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
            padding: '8px 12px',
            background: 'var(--surface-elevated, #131E2F)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-subtle, #142232)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-tertiary, #718096)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Preview Projection:
            </span>
            <div style={{ display: 'inline-flex', gap: '4px' }}>
              {(
                [
                  { id: 'canonical', label: 'Canonical' },
                  { id: 'devto', label: 'DEV.to' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'hashnode', label: 'Hashnode' },
                ] as const
              ).map((mode) => {
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      borderRadius: 'var(--radius-sm, 4px)',
                      border: isActive
                        ? '1px solid var(--axf-cyan, #19D7FE)'
                        : '1px solid transparent',
                      background: isActive ? 'rgba(25, 215, 254, 0.12)' : 'transparent',
                      color: isActive
                        ? 'var(--axf-cyan, #19D7FE)'
                        : 'var(--text-secondary, #AAB5C4)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          {canonicalUrl && (
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-tertiary, #718096)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Canonical:</span>
              <code
                style={{
                  fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                  color: 'var(--axf-cyan, #19D7FE)',
                  background: 'rgba(25, 215, 254, 0.08)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                }}
              >
                {canonicalUrl}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Main Preview Container */}
      <article
        className={`axf-preview-article axf-projection-${activeMode}`}
        style={getContainerStyle()}
      >
        {/* Cover Image */}
        {coverImageUrl && (
          <div
            className="axf-preview-cover"
            style={{
              marginBottom: '28px',
              borderRadius: 'var(--radius-md, 8px)',
              overflow: 'hidden',
              maxHeight: '380px',
              border: '1px solid var(--border-subtle, #142232)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImageUrl}
              alt={title || 'Cover image'}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '380px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Header Section */}
        <header style={{ marginBottom: '28px' }}>
          {/* Platform Tag / Projection Pill */}
          {activeMode !== 'canonical' && (
            <div style={{ marginBottom: '12px' }}>
              <Badge variant="info">{`Simulated ${platformNames[activeMode]} Preview`}</Badge>
            </div>
          )}

          {/* Title */}
          {title ? (
            <h1
              style={{
                fontSize: activeMode === 'medium' ? '38px' : '34px',
                fontWeight: 750,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                color: 'var(--text-primary, #F5F7FA)',
                margin: '0 0 12px 0',
              }}
            >
              {title}
            </h1>
          ) : (
            <h1
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: 'var(--text-tertiary, #718096)',
                fontStyle: 'italic',
                margin: '0 0 12px 0',
              }}
            >
              Untitled Article
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p
              style={{
                fontSize: '18px',
                lineHeight: 1.5,
                color: 'var(--text-secondary, #AAB5C4)',
                margin: '0 0 20px 0',
                fontWeight: 400,
              }}
            >
              {subtitle}
            </p>
          )}

          {/* Metadata: Author, Date, Reading Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '16px',
              paddingBottom: '16px',
              borderTop: '1px solid var(--border-subtle, #142232)',
              borderBottom: '1px solid var(--border-subtle, #142232)',
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar name={author?.name || 'Author'} src={author?.image || undefined} size="sm" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  {author?.name || 'Author'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary, #718096)' }}>
                  {`${formattedDate} • ${readingTime} min read`}
                </div>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '12px',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 4px)',
                      background:
                        activeMode === 'devto'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'var(--surface-elevated, #131E2F)',
                      border: '1px solid var(--border-subtle, #142232)',
                      color:
                        activeMode === 'devto'
                          ? 'var(--text-secondary, #AAB5C4)'
                          : 'var(--axf-cyan, #19D7FE)',
                      fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                    }}
                  >
                    {activeMode === 'devto' ? `#${tag}` : tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content Body */}
        <ArticleRenderer content={content} />
      </article>
    </div>
  );
};
