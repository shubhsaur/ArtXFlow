'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface ArticleItemData {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string | Date;
  createdAt: string | Date;
  words: number;
  readingTimeMinutes: number;
  tags: string[];
  canonicalUrl?: string | null;
  canonicalDomain?: string;
  publications: Array<{
    destinationId: string;
    destinationType: string;
    status: string;
    externalUrl?: string | null;
    lastErrorMessage?: string | null;
    lastErrorCode?: string | null;
  }>;
  isScheduled?: boolean;
  scheduledAt?: string | Date;
}

export interface ArticlesHubMatrixTableProps {
  articles: ArticleItemData[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
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

export function ArticlesHubMatrixTable({
  articles,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onSyncArticle,
  onDeleteArticle,
  syncingArticleId,
}: ArticlesHubMatrixTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const allSelected = articles.length > 0 && selectedIds.size === articles.length;

  return (
    <section
      style={{
        width: '100%',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle, #172333)',
        backgroundColor: 'var(--surface-raised, #0D1420)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '1050px' }}>
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--surface-base, #070B12)',
                borderBottom: '1px solid var(--border-subtle, #172333)',
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted, #66768D)',
              }}
            >
              <th style={{ width: '48px', padding: '12px 16px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  aria-label="Select all articles"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: 'var(--surface-raised, #0D1420)',
                    borderColor: 'var(--border-default, #243447)',
                    accentColor: 'var(--flow-blue, #0B87FE)',
                    cursor: 'pointer',
                  }}
                />
              </th>
              <th style={{ minWidth: '340px', padding: '12px 16px' }}>CANONICAL ARTICLE &amp; METADATA</th>
              <th style={{ minWidth: '150px', padding: '12px 16px' }}>PRIMARY TARGET</th>
              <th style={{ minWidth: '420px', padding: '12px 16px' }}>MULTI-PLATFORM SYNDICATION MATRIX</th>
              <th style={{ minWidth: '130px', padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '13px' }}>
            {articles.map((article) => {
              const isSelected = selectedIds.has(article.id);
              const isSyncing = syncingArticleId === article.id;
              const hasIssues = article.publications.some((p) => p.status === 'FAILED');

              // Map destination status
              const devPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'devto');
              const hashPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'hashnode');
              const medPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'medium');

              return (
                <tr
                  key={article.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle, #172333)',
                    backgroundColor: isSelected
                      ? 'rgba(11, 135, 254, 0.05)'
                      : hasIssues
                        ? 'rgba(217, 45, 32, 0.04)'
                        : 'transparent',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(article.id)}
                      aria-label={`Select ${article.title}`}
                      style={{
                        marginTop: '2px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface-raised, #0D1420)',
                        borderColor: 'var(--border-default, #243447)',
                        accentColor: 'var(--flow-blue, #0B87FE)',
                        cursor: 'pointer',
                      }}
                    />
                  </td>

                  {/* Canonical Article & Metadata */}
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Link
                          href={`/articles/${article.id}`}
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            lineHeight: '20px',
                            color: 'var(--text-primary, #F5F7FA)',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--flow-cyan, #19D7FE)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary, #F5F7FA)')}
                        >
                          {article.title}
                        </Link>
                        {hasIssues && (
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(217, 45, 32, 0.2)',
                              border: '1px solid rgba(217, 45, 32, 0.4)',
                              color: 'var(--status-error, #D92D20)',
                              fontSize: '10px',
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 600,
                            }}
                          >
                            Diverged
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '11px',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: 'var(--text-muted, #66768D)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>/{article.slug}</span>
                        <span>•</span>
                        <span>{article.words} words</span>
                        <span>•</span>
                        <span>{article.readingTimeMinutes} min read</span>
                        <span>•</span>
                        <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>
                          Updated {formatRelativeTime(article.updatedAt)}
                        </span>
                      </div>

                      {/* Tag Badges */}
                      {article.tags.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px', flexWrap: 'wrap' }}>
                          {article.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--surface-base, #070B12)',
                                border: '1px solid var(--border-subtle, #172333)',
                                fontSize: '11px',
                                fontFamily: "'JetBrains Mono', monospace",
                                color: 'var(--text-secondary, #AAB5C4)',
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Primary Target */}
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--surface-base, #070B12)',
                        border: '1px solid var(--border-subtle, #172333)',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-primary, #F5F7FA)',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-cyan, #19D7FE)' }}>
                        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                      <span>{article.canonicalDomain || 'artxflow.dev'}</span>
                      {article.canonicalUrl && (
                        <a
                          href={article.canonicalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open canonical source"
                          style={{ color: 'var(--text-muted, #66768D)', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted, #66768D)', marginTop: '4px' }}>
                      (Canonical origin)
                    </div>
                  </td>

                  {/* Multi-Platform Syndication Matrix */}
                  <td style={{ padding: '16px', verticalAlign: 'top' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                      {/* DEV.to */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-subtle, #172333)',
                          fontSize: '11px',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '999px',
                              backgroundColor: devPub?.status === 'PUBLISHED'
                                ? 'var(--status-success, #12B76A)'
                                : devPub?.status === 'FAILED'
                                  ? 'var(--status-error, #D92D20)'
                                  : 'var(--text-muted, #66768D)',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>DEV.to</span>
                        </div>
                        {devPub?.externalUrl ? (
                          <a
                            href={devPub.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--status-success, #12B76A)', textDecoration: 'none', fontSize: '10px' }}
                          >
                            Live ↗
                          </a>
                        ) : devPub?.status === 'FAILED' ? (
                          <span style={{ color: 'var(--status-error, #D92D20)', fontSize: '10px' }}>Failed</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted, #66768D)', fontSize: '10px' }}>Unbound</span>
                        )}
                      </div>

                      {/* Hashnode */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-subtle, #172333)',
                          fontSize: '11px',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '999px',
                              backgroundColor: hashPub?.status === 'PUBLISHED'
                                ? 'var(--status-success, #12B76A)'
                                : hashPub?.status === 'FAILED'
                                  ? 'var(--status-error, #D92D20)'
                                  : 'var(--text-muted, #66768D)',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Hashnode</span>
                        </div>
                        {hashPub?.externalUrl ? (
                          <a
                            href={hashPub.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--status-success, #12B76A)', textDecoration: 'none', fontSize: '10px' }}
                          >
                            Live ↗
                          </a>
                        ) : hashPub?.status === 'FAILED' ? (
                          <span style={{ color: 'var(--status-error, #D92D20)', fontSize: '10px' }}>Failed</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted, #66768D)', fontSize: '10px' }}>Unbound</span>
                        )}
                      </div>

                      {/* Medium */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: medPub?.status === 'FAILED' ? 'rgba(147, 0, 10, 0.15)' : 'var(--surface-base, #070B12)',
                          border: medPub?.status === 'FAILED' ? '1px solid rgba(217, 45, 32, 0.4)' : '1px solid var(--border-subtle, #172333)',
                          fontSize: '11px',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '999px',
                              backgroundColor: medPub?.status === 'PUBLISHED'
                                ? 'var(--status-success, #12B76A)'
                                : medPub?.status === 'FAILED'
                                  ? 'var(--status-error, #D92D20)'
                                  : 'var(--text-muted, #66768D)',
                            }}
                          />
                          <span style={{ fontWeight: 600, color: medPub?.status === 'FAILED' ? 'var(--status-error, #D92D20)' : 'var(--text-primary, #F5F7FA)' }}>Medium</span>
                        </div>
                        {medPub?.externalUrl ? (
                          <a
                            href={medPub.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--status-success, #12B76A)', textDecoration: 'none', fontSize: '10px' }}
                          >
                            Live ↗
                          </a>
                        ) : medPub?.status === 'FAILED' ? (
                          <span style={{ color: 'var(--status-error, #D92D20)', fontSize: '10px' }}>Alert</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted, #66768D)', fontSize: '10px' }}>Unbound</span>
                        )}
                      </div>

                      {/* Schedule / Draft info */}
                      {article.isScheduled ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(11, 135, 254, 0.1)',
                            border: '1px solid rgba(11, 135, 254, 0.3)',
                            fontSize: '11px',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--flow-cyan, #19D7FE)' }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '999px', backgroundColor: 'var(--flow-blue, #0B87FE)' }} />
                            <span style={{ fontWeight: 600 }}>Scheduled</span>
                          </div>
                          <span style={{ color: 'var(--flow-cyan, #19D7FE)', fontSize: '10px' }}>
                            {article.scheduledAt ? new Date(article.scheduledAt).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={`/articles/${article.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px dashed var(--border-subtle, #172333)',
                            fontSize: '11px',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: 'var(--text-muted, #66768D)',
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--flow-cyan, #19D7FE)';
                            e.currentTarget.style.borderColor = 'var(--flow-blue, #0B87FE)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted, #66768D)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle, #172333)';
                          }}
                        >
                          + Bind Targets
                        </Link>
                      )}
                    </div>
                  </td>

                  {/* Actions (Edit, Sync, More) */}
                  <td style={{ padding: '16px', verticalAlign: 'top', textAlign: 'right', position: 'relative' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Link
                        href={`/articles/${article.id}`}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-default, #243447)',
                          color: 'var(--text-primary, #F5F7FA)',
                          fontSize: '12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => onSyncArticle(article.id)}
                        disabled={isSyncing}
                        title="Sync article to destinations"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: isSyncing ? 'var(--flow-cyan, #19D7FE)' : 'var(--text-muted, #66768D)',
                          cursor: isSyncing ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
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
                      </button>

                      {/* More Menu Trigger */}
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === article.id ? null : article.id)}
                        title="More options"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted, #66768D)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === article.id && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '16px',
                            top: '48px',
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
                          {article.canonicalUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(article.canonicalUrl!);
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
                              Copy Canonical URL
                            </button>
                          )}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
