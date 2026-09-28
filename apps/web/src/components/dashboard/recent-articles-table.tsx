'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface ArticlePublicationSummary {
  destinationType: string;
  status: string;
  externalUrl?: string | null;
  errorMessage?: string | null;
}

export interface DashboardArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string | Date;
  publications: ArticlePublicationSummary[];
  canonicalBranch?: string;
  commitHash?: string;
}

interface RecentArticlesTableProps {
  articles: DashboardArticleItem[];
  totalArticlesCount: number;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function RecentArticlesTable({ articles, totalArticlesCount }: RecentArticlesTableProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'synced' | 'attention'>('all');

  // Filter articles based on active tab
  const filteredArticles = articles.filter((article) => {
    if (activeTab === 'all') return true;

    const hasFailed = article.publications.some((p) => p.status === 'FAILED');
    const isDraft = article.status === 'DRAFT';
    const isInProgress = article.publications.some(
      (p) => p.status === 'PENDING' || p.status === 'IN_PROGRESS',
    );

    if (activeTab === 'attention') {
      return hasFailed || isDraft || isInProgress;
    }

    if (activeTab === 'synced') {
      return !hasFailed && !isDraft && article.publications.some((p) => p.status === 'PUBLISHED');
    }

    return true;
  });

  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundColor: '#0F141B',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Table Header with Filter Tabs */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#0F141B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#F5F7FA',
              margin: 0,
            }}
          >
            Recent Articles
          </h2>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary, #AAB5C4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            {totalArticlesCount} total
          </span>
        </div>

        {/* Filter Tabs & See All Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px',
              borderRadius: '8px',
              backgroundColor: '#0A0E15',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              gap: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: activeTab === 'all' ? 600 : 400,
                backgroundColor: activeTab === 'all' ? '#141A23' : 'transparent',
                color: activeTab === 'all' ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('synced')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: activeTab === 'synced' ? 600 : 400,
                backgroundColor: activeTab === 'synced' ? '#141A23' : 'transparent',
                color: activeTab === 'synced' ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Synced
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('attention')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: activeTab === 'attention' ? 600 : 400,
                backgroundColor: activeTab === 'attention' ? '#141A23' : 'transparent',
                color:
                  activeTab === 'attention'
                    ? 'var(--amber-accent, #F59E0B)'
                    : 'var(--text-secondary, #AAB5C4)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Needs Attention</span>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--amber-accent, #F59E0B)',
                }}
              />
            </button>
          </div>

          <Link
            href="/articles"
            style={{
              fontSize: '12px',
              color: 'var(--flow-cyan, #19D7FE)',
              textDecoration: 'none',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>See all</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Content Area */}
      {articles.length === 0 ? (
        /* Empty State */
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'rgba(11, 135, 254, 0.1)',
              color: 'var(--flow-cyan, #19D7FE)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '1px solid rgba(25, 215, 254, 0.25)',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>

          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#F5F7FA',
              marginBottom: '6px',
            }}
          >
            No canonical articles authored yet
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              maxWidth: '460px',
              margin: '0 auto 20px',
              lineHeight: 1.5,
            }}
          >
            Author your first canonical Markdown post in the studio. Once created, you can project
            it across DEV.to, Medium, Hashnode, and your hosted publication with automatic SEO
            canonical linking.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              maxWidth: '640px',
              margin: '0 auto 24px',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#141A23',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '15px', marginBottom: '4px' }}>⚡️</div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#F5F7FA', marginBottom: '2px' }}
              >
                Technical Deep Dive
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Code blocks, diagrams, and system architecture reviews.
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#141A23',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '15px', marginBottom: '4px' }}>🚀</div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#F5F7FA', marginBottom: '2px' }}
              >
                Product Release Notes
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Syndicate changelogs and launch announcements simultaneously.
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#141A23',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '15px', marginBottom: '4px' }}>💡</div>
              <div
                style={{ fontSize: '12px', fontWeight: 600, color: '#F5F7FA', marginBottom: '2px' }}
              >
                Developer Guide & Tips
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Actionable walkthroughs formatted per destination guidelines.
              </div>
            </div>
          </div>

          <Link
            href="/articles/new"
            className="btn-gradient-primary"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <span>+ Author First Canonical Article</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table View (min-width: 768px) */}
          <div className="hidden md:block" style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'rgba(10, 14, 21, 0.6)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-secondary, #AAB5C4)',
                  }}
                >
                  <th style={{ padding: '10px 16px', fontWeight: 500 }}>
                    Article & Canonical Slug
                  </th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>Canonical Source</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>Destinations</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>Last Synced</th>
                  <th style={{ padding: '10px 16px', fontWeight: 500, textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article, idx) => {
                  const devPub = article.publications.find(
                    (p) => p.destinationType.toLowerCase() === 'devto',
                  );
                  const medPub = article.publications.find(
                    (p) => p.destinationType.toLowerCase() === 'medium',
                  );
                  const hashPub = article.publications.find(
                    (p) => p.destinationType.toLowerCase() === 'hashnode',
                  );
                  const isReady = article.status === 'READY';
                  const hasFailed = article.publications.some((p) => p.status === 'FAILED');

                  const shortHash = article.commitHash || article.id.slice(-6);
                  const branchName = article.canonicalBranch || 'main';

                  return (
                    <tr
                      key={article.id}
                      style={{
                        borderBottom:
                          idx !== filteredArticles.length - 1
                            ? '1px solid rgba(255, 255, 255, 0.05)'
                            : 'none',
                        transition: 'background-color 0.15s ease',
                      }}
                      className="hover:bg-[#141A23]"
                    >
                      {/* 1. Article & Canonical Slug */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link
                              href={`/articles/${article.id}`}
                              style={{
                                color: '#F5F7FA',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '13px',
                                transition: 'color 0.15s ease',
                              }}
                              className="hover:text-[#19D7FE]"
                            >
                              {article.title}
                            </Link>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor:
                                  article.status === 'READY'
                                    ? 'rgba(18, 183, 106, 0.12)'
                                    : article.status === 'DRAFT'
                                      ? 'rgba(245, 158, 11, 0.12)'
                                      : 'rgba(255, 255, 255, 0.05)',
                                color:
                                  article.status === 'READY'
                                    ? '#12B76A'
                                    : article.status === 'DRAFT'
                                      ? 'var(--amber-accent, #F59E0B)'
                                      : 'var(--text-secondary, #AAB5C4)',
                              }}
                            >
                              {article.status}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontFamily: "'JetBrains Mono', monospace",
                              color: 'var(--text-secondary, #AAB5C4)',
                            }}
                          >
                            /{article.slug}
                          </span>
                        </div>
                      </td>

                      {/* 2. Canonical Source */}
                      <td style={{ padding: '14px 14px' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '11px',
                            color: '#DEE2ED',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#141A23',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ color: 'var(--text-muted, #66768D)' }}
                            aria-hidden="true"
                          >
                            <circle cx="12" cy="12" r="4" />
                            <line x1="1.05" y1="12" x2="7" y2="12" />
                            <line x1="17.01" y1="12" x2="22.96" y2="12" />
                          </svg>
                          <span>{branchName}</span>
                          <span style={{ color: 'var(--text-muted, #66768D)' }}>#{shortHash}</span>
                        </div>
                      </td>

                      {/* 3. Destinations Chips */}
                      <td style={{ padding: '14px 14px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexWrap: 'wrap',
                          }}
                        >
                          {/* DEV.to */}
                          {devPub ? (
                            devPub.status === 'PUBLISHED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(18, 183, 106, 0.12)',
                                  color: '#12B76A',
                                  border: '1px solid rgba(18, 183, 106, 0.25)',
                                }}
                              >
                                DEV
                              </span>
                            ) : devPub.status === 'FAILED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(217, 45, 32, 0.15)',
                                  color: '#FFB4AB',
                                  border: '1px solid rgba(217, 45, 32, 0.3)',
                                }}
                              >
                                DEV error
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                  color: 'var(--amber-accent, #F59E0B)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                              >
                                DEV sync
                              </span>
                            )
                          ) : (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-muted, #66768D)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              DEV
                            </span>
                          )}

                          {/* Hashnode */}
                          {hashPub ? (
                            hashPub.status === 'PUBLISHED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(18, 183, 106, 0.12)',
                                  color: '#12B76A',
                                  border: '1px solid rgba(18, 183, 106, 0.25)',
                                }}
                              >
                                Hashnode
                              </span>
                            ) : hashPub.status === 'FAILED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(217, 45, 32, 0.15)',
                                  color: '#FFB4AB',
                                  border: '1px solid rgba(217, 45, 32, 0.3)',
                                }}
                              >
                                Hashnode error
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                  color: 'var(--amber-accent, #F59E0B)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                              >
                                Hashnode sync
                              </span>
                            )
                          ) : (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-muted, #66768D)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              Hashnode
                            </span>
                          )}

                          {/* Medium */}
                          {medPub ? (
                            medPub.status === 'PUBLISHED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(18, 183, 106, 0.12)',
                                  color: '#12B76A',
                                  border: '1px solid rgba(18, 183, 106, 0.25)',
                                }}
                              >
                                Medium
                              </span>
                            ) : medPub.status === 'FAILED' ? (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(217, 45, 32, 0.15)',
                                  color: '#FFB4AB',
                                  border: '1px solid rgba(217, 45, 32, 0.3)',
                                }}
                              >
                                Medium auth
                              </span>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 500,
                                  padding: '2px 7px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                  color: 'var(--amber-accent, #F59E0B)',
                                  border: '1px solid rgba(245, 158, 11, 0.25)',
                                }}
                              >
                                Medium sync
                              </span>
                            )
                          ) : (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                color: 'var(--text-muted, #66768D)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                              }}
                            >
                              Medium
                            </span>
                          )}

                          {/* Hosted Blog (Always enabled) */}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: isReady
                                ? 'rgba(18, 183, 106, 0.12)'
                                : 'rgba(255, 255, 255, 0.04)',
                              color: isReady ? '#12B76A' : 'var(--text-muted, #66768D)',
                              border: `1px solid ${isReady ? 'rgba(18, 183, 106, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                            }}
                          >
                            Blog
                          </span>
                        </div>
                      </td>

                      {/* 4. Last Synced */}
                      <td style={{ padding: '14px 14px' }}>
                        {hasFailed ? (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#FFB4AB',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Failed ({formatRelativeTime(article.updatedAt)})
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary, #AAB5C4)',
                            }}
                          >
                            {formatRelativeTime(article.updatedAt)}
                          </span>
                        )}
                      </td>

                      {/* 5. Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Link
                            href={`/articles/${article.id}`}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#141A23',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#DEE2ED',
                              fontSize: '11px',
                              fontWeight: 500,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>Open</span>
                            <span style={{ fontSize: '12px' }}>↗</span>
                          </Link>

                          {article.status === 'DRAFT' && (
                            <Link
                              href={`/articles/${article.id}/publish`}
                              className="btn-gradient-primary"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span>Publish</span>
                              <span>→</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Stack View (screens < 768px) */}
          <div
            className="block md:hidden"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            {filteredArticles.map((article) => {
              const devPub = article.publications.find(
                (p) => p.destinationType.toLowerCase() === 'devto',
              );
              const medPub = article.publications.find(
                (p) => p.destinationType.toLowerCase() === 'medium',
              );
              const hashPub = article.publications.find(
                (p) => p.destinationType.toLowerCase() === 'hashnode',
              );
              const hasFailed = article.publications.some((p) => p.status === 'FAILED');
              const isDraft = article.status === 'DRAFT';
              const shortHash = article.commitHash || article.id.slice(-6);

              return (
                <div
                  key={article.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#141A23',
                    border: hasFailed
                      ? '1px solid rgba(217, 45, 32, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <Link
                        href={`/articles/${article.id}`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          textDecoration: 'none',
                        }}
                      >
                        {article.title}
                      </Link>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: 'var(--text-secondary, #AAB5C4)',
                        }}
                      >
                        /{article.slug}
                      </span>
                    </div>

                    {/* Status Icon */}
                    {hasFailed ? (
                      <span style={{ color: '#FFB4AB', fontSize: '16px' }} title="Attention needed">
                        ⚠
                      </span>
                    ) : isDraft ? (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: 'var(--amber-accent, #F59E0B)',
                        }}
                      >
                        Draft
                      </span>
                    ) : (
                      <span style={{ color: '#12B76A', fontSize: '15px' }}>✓</span>
                    )}
                  </div>

                  {/* Commit & Destinations row */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-secondary, #AAB5C4)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#0F141B',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      main #{shortHash}
                    </span>

                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          devPub?.status === 'PUBLISHED'
                            ? 'rgba(18, 183, 106, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          devPub?.status === 'PUBLISHED' ? '#12B76A' : 'var(--text-muted, #66768D)',
                      }}
                    >
                      DEV
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          hashPub?.status === 'PUBLISHED'
                            ? 'rgba(18, 183, 106, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          hashPub?.status === 'PUBLISHED'
                            ? '#12B76A'
                            : 'var(--text-muted, #66768D)',
                      }}
                    >
                      Hashnode
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          medPub?.status === 'PUBLISHED'
                            ? 'rgba(18, 183, 106, 0.15)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          medPub?.status === 'PUBLISHED' ? '#12B76A' : 'var(--text-muted, #66768D)',
                      }}
                    >
                      Medium
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(18, 183, 106, 0.15)',
                        color: '#12B76A',
                      }}
                    >
                      Blog
                    </span>
                  </div>

                  {/* Mobile Card Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: '11px',
                    }}
                  >
                    <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>
                      Synced {formatRelativeTime(article.updatedAt)}
                    </span>

                    <Link
                      href={`/articles/${article.id}`}
                      style={{
                        color: 'var(--flow-cyan, #19D7FE)',
                        textDecoration: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {isDraft ? 'Edit Draft →' : 'Inspect Payload →'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination / Table Footer */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: 'rgba(10, 14, 21, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            <span>
              Showing {filteredArticles.length} of {totalArticlesCount} articles
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                disabled
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: '#141A23',
                  color: 'var(--text-muted, #66768D)',
                  fontSize: '11px',
                  cursor: 'not-allowed',
                }}
              >
                Previous
              </button>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                Page 1 / 1
              </span>
              <button
                type="button"
                disabled
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: '#141A23',
                  color: 'var(--text-muted, #66768D)',
                  fontSize: '11px',
                  cursor: 'not-allowed',
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
