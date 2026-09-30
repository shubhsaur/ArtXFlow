'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { ArticleItemData } from './articles-hub-matrix-table';

export interface ArticlesHubCardListProps {
  articles: ArticleItemData[];
  onSyncArticle: (articleId: string) => void;
  onDeleteArticle: (article: ArticleItemData) => void;
  syncingArticleId?: string | null;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ArticlesHubCardList({
  articles,
  onSyncArticle,
  onDeleteArticle,
  syncingArticleId,
}: ArticlesHubCardListProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {articles.map((article) => {
        const isSyncing = syncingArticleId === article.id;
        const hasIssues = article.publications.some((p) => p.status === 'FAILED');
        const isDraft = article.status === 'DRAFT';

        const devPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'devto');
        const hashPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'hashnode');
        const medPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'medium');

        return (
          <article
            key={article.id}
            style={{
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: hasIssues
                ? '1px solid rgba(217, 45, 32, 0.4)'
                : isDraft
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : '1px solid var(--border-default, #243447)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              position: 'relative',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Top row: Status, timestamp, slug, and more trigger */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {hasIssues ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(217, 45, 32, 0.15)',
                        border: '1px solid rgba(217, 45, 32, 0.4)',
                        color: 'var(--status-error, #D92D20)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '999px', backgroundColor: 'var(--status-error, #D92D20)' }} />
                      Diverged
                    </span>
                  ) : isDraft ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(69, 26, 3, 0.6)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#FBBF24',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '999px', backgroundColor: 'var(--status-warning, #F59E0B)' }} />
                      Local Draft
                    </span>
                  ) : article.isScheduled ? (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(11, 135, 254, 0.15)',
                        border: '1px solid rgba(11, 135, 254, 0.35)',
                        color: 'var(--flow-cyan, #19D7FE)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      ⏰ Scheduled
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(18, 183, 106, 0.12)',
                        border: '1px solid rgba(18, 183, 106, 0.3)',
                        color: 'var(--status-success, #12B76A)',
                      }}
                    >
                      Published
                    </span>
                  )}

                  <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                    {formatRelativeTime(article.updatedAt)}
                  </span>

                  <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--flow-cyan, #19D7FE)' }}>
                    /{article.slug}
                  </span>
                </div>

                {/* Article Title */}
                <h2 style={{ fontSize: '15px', fontWeight: 600, lineHeight: '21px', color: 'var(--text-primary, #F5F7FA)', margin: '4px 0 0' }}>
                  <Link
                    href={`/articles/${article.id}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {article.title}
                  </Link>
                </h2>
              </div>

              {/* More Vertical Trigger */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                  aria-label="Article actions"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #66768D)',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>

                {activeMenuId === article.id && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '32px',
                      zIndex: 50,
                      minWidth: '150px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface-overlay, #111A28)',
                      border: '1px solid var(--border-default, #243447)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                      padding: '4px',
                      textAlign: 'left',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`/${article.slug}`);
                        setActiveMenuId(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontSize: '12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'var(--text-primary, #F5F7FA)',
                        cursor: 'pointer',
                      }}
                    >
                      Copy Slug
                    </button>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-subtle, #172333)', margin: '4px 0' }} />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeleteArticle(article);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontSize: '12px',
                        background: 'none',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'var(--status-error, #D92D20)',
                        cursor: 'pointer',
                      }}
                    >
                      Delete Article
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Canonical Metadata Line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary, #AAB5C4)',
                borderBottom: '1px solid var(--border-subtle, #172333)',
                paddingBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-cyan, #19D7FE)' }}>
                  <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                  <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                </svg>
                {article.canonicalDomain || 'artxflow.dev'}
              </span>
              <span>·</span>
              <span>{article.words} words</span>
              <span>·</span>
              <span>{article.readingTimeMinutes}m read</span>
            </div>

            {/* Platform Syndication Matrix Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                Syndication Matrix
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {/* DEV.to */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-overlay, #111A28)',
                    border: '1px solid var(--border-default, #243447)',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>DEV</span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '999px',
                      backgroundColor: devPub?.status === 'PUBLISHED'
                        ? 'var(--status-success, #12B76A)'
                        : devPub?.status === 'FAILED'
                          ? 'var(--status-error, #D92D20)'
                          : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {devPub?.status === 'PUBLISHED' && <span style={{ color: 'var(--status-success, #12B76A)', fontSize: '10px' }}>Live</span>}
                </div>

                {/* Hashnode */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-overlay, #111A28)',
                    border: '1px solid var(--border-default, #243447)',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Hashnode</span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '999px',
                      backgroundColor: hashPub?.status === 'PUBLISHED'
                        ? 'var(--status-success, #12B76A)'
                        : hashPub?.status === 'FAILED'
                          ? 'var(--status-error, #D92D20)'
                          : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {hashPub?.status === 'PUBLISHED' && <span style={{ color: 'var(--status-success, #12B76A)', fontSize: '10px' }}>Live</span>}
                </div>

                {/* Medium */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: medPub?.status === 'FAILED' ? 'rgba(147, 0, 10, 0.2)' : 'var(--surface-overlay, #111A28)',
                    border: medPub?.status === 'FAILED' ? '1px solid rgba(217, 45, 32, 0.4)' : '1px solid var(--border-default, #243447)',
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ fontWeight: 600, color: medPub?.status === 'FAILED' ? 'var(--status-error, #D92D20)' : 'var(--text-primary, #F5F7FA)' }}>Medium</span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '999px',
                      backgroundColor: medPub?.status === 'PUBLISHED'
                        ? 'var(--status-success, #12B76A)'
                        : medPub?.status === 'FAILED'
                          ? 'var(--status-error, #D92D20)'
                          : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {medPub?.status === 'FAILED' && <span style={{ color: 'var(--status-error, #D92D20)', fontSize: '10px' }}>Error</span>}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  href={`/articles/${article.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-overlay, #111A28)',
                    border: '1px solid var(--border-default, #243447)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit</span>
                </Link>

                <button
                  type="button"
                  onClick={() => onSyncArticle(article.id)}
                  disabled={isSyncing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-overlay, #111A28)',
                    border: '1px solid var(--border-default, #243447)',
                    color: isSyncing ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
                    fontSize: '12px',
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: isSyncing ? 'not-allowed' : 'pointer',
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }}
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>Sync</span>
                </button>
              </div>

              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                {article.publications.filter((p) => p.status === 'PUBLISHED').length}/{Math.max(1, article.publications.length)} synced
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
