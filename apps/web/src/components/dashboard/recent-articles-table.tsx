import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge } from '@artxflow/ui';

export interface ArticlePublicationSummary {
  destinationType: string;
  status: string;
  externalUrl?: string | null;
}

export interface DashboardArticleItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string | Date;
  publications: ArticlePublicationSummary[];
}

interface RecentArticlesTableProps {
  articles: DashboardArticleItem[];
  totalArticlesCount: number;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return 'Just now';
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
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RecentArticlesTable({ articles, totalArticlesCount }: RecentArticlesTableProps) {
  return (
    <Card style={{ overflow: 'hidden', backgroundColor: '#1F2937' }}>
      <CardHeader style={{ paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CardTitle style={{ fontSize: '18px', fontWeight: 700 }}>
                Recent Content & Distribution Status
              </CardTitle>
              {totalArticlesCount > 0 && (
                <Badge variant="info">{totalArticlesCount} total</Badge>
              )}
            </div>
            <CardDescription style={{ marginTop: '4px' }}>
              Canonical source of truth articles and their live external projections.
            </CardDescription>
          </div>

          {totalArticlesCount > 0 && (
            <Link
              href="/articles"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--axf-cyan, #19D7FE)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View all articles →
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ padding: 0 }}>
        {articles.length === 0 ? (
          /* Empty State */
          <div style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(25, 215, 254, 0.08)',
                color: 'var(--axf-cyan, #19D7FE)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                border: '1px solid rgba(25, 215, 254, 0.2)',
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', marginBottom: '8px' }}>
              No canonical articles authored yet
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #AAB5C4)',
                maxWidth: '480px',
                margin: '0 auto 24px',
                lineHeight: 1.5,
              }}
            >
              Author your first canonical Markdown post in the studio. Once created, you can project it across DEV.to, Medium, Hashnode, and your hosted publication with automatic SEO canonical linking.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                maxWidth: '680px',
                margin: '0 auto 28px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '6px' }}>⚡️</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', marginBottom: '4px' }}>
                  Technical Deep Dive
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  Code blocks, diagrams, and system architecture reviews.
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '6px' }}>🚀</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', marginBottom: '4px' }}>
                  Product Release Notes
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  Syndicate changelogs and launch announcements simultaneously.
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '16px', marginBottom: '6px' }}>💡</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', marginBottom: '4px' }}>
                  Developer Guide & Tips
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  Actionable walkthroughs formatted per destination guidelines.
                </div>
              </div>
            </div>

            <Link href="/articles/new">
              <Button variant="primary" size="md">
                + Author First Canonical Article
              </Button>
            </Link>
          </div>
        ) : (
          /* Articles List */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {articles.map((article, index) => {
              const devPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'devto');
              const medPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'medium');
              const hashPub = article.publications.find((p) => p.destinationType.toLowerCase() === 'hashnode');
              const isReady = article.status === 'READY';

              return (
                <div
                  key={article.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '18px 20px',
                    borderBottom: index !== articles.length - 1 ? '1px solid var(--border, #1C2A3A)' : 'none',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    {/* Title & Metadata */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <Link
                          href={`/articles/${article.id}`}
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'var(--text-primary, #F5F7FA)',
                            textDecoration: 'none',
                          }}
                        >
                          {article.title}
                        </Link>

                        <Badge
                          variant={
                            article.status === 'READY'
                              ? 'success'
                              : article.status === 'ARCHIVED'
                                ? 'default'
                                : 'warning'
                          }
                        >
                          {article.status}
                        </Badge>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
                        <code style={{ color: 'var(--axf-cyan, #19D7FE)', fontSize: '12px' }}>
                          /{article.slug}
                        </code>
                        <span>·</span>
                        <span>Updated {formatRelativeTime(article.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Edit CTA */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link href={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" size="sm">
                          Edit Studio →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Multi-Platform Projection Matrix */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      paddingTop: '4px',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary, #AAB5C4)', marginRight: '4px' }}>
                      Destinations:
                    </span>

                    {/* DEV.to */}
                    {devPub ? (
                      devPub.status === 'PUBLISHED' ? (
                        <a
                          href={devPub.externalUrl || '#'}
                          target={devPub.externalUrl ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(11, 135, 254, 0.15)',
                              color: '#60A5FA',
                              border: '1px solid rgba(11, 135, 254, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            DEV.to ✓ {devPub.externalUrl && '↗'}
                          </span>
                        </a>
                      ) : devPub.status === 'FAILED' ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                          }}
                        >
                          DEV.to ✕ Failed
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(25, 215, 254, 0.15)',
                            color: 'var(--axf-cyan, #19D7FE)',
                            border: '1px solid rgba(25, 215, 254, 0.35)',
                          }}
                        >
                          DEV.to ⏳ Syncing
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-elevated, #131E2F)',
                          color: 'var(--text-tertiary, #718096)',
                          border: '1px solid var(--border, #1C2A3A)',
                        }}
                      >
                        DEV.to —
                      </span>
                    )}

                    {/* Medium */}
                    {medPub ? (
                      medPub.status === 'PUBLISHED' ? (
                        <a
                          href={medPub.externalUrl || '#'}
                          target={medPub.externalUrl ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(0, 171, 108, 0.15)',
                              color: '#34D399',
                              border: '1px solid rgba(0, 171, 108, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Medium ✓ {medPub.externalUrl && '↗'}
                          </span>
                        </a>
                      ) : medPub.status === 'FAILED' ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                          }}
                        >
                          Medium ✕ Failed
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(25, 215, 254, 0.15)',
                            color: 'var(--axf-cyan, #19D7FE)',
                            border: '1px solid rgba(25, 215, 254, 0.35)',
                          }}
                        >
                          Medium ⏳ Syncing
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-elevated, #131E2F)',
                          color: 'var(--text-tertiary, #718096)',
                          border: '1px solid var(--border, #1C2A3A)',
                        }}
                      >
                        Medium —
                      </span>
                    )}

                    {/* Hashnode */}
                    {hashPub ? (
                      hashPub.status === 'PUBLISHED' ? (
                        <a
                          href={hashPub.externalUrl || '#'}
                          target={hashPub.externalUrl ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(41, 98, 255, 0.15)',
                              color: '#93C5FD',
                              border: '1px solid rgba(41, 98, 255, 0.35)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            Hashnode ✓ {hashPub.externalUrl && '↗'}
                          </span>
                        </a>
                      ) : hashPub.status === 'FAILED' ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                          }}
                        >
                          Hashnode ✕ Failed
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(25, 215, 254, 0.15)',
                            color: 'var(--axf-cyan, #19D7FE)',
                            border: '1px solid rgba(25, 215, 254, 0.35)',
                          }}
                        >
                          Hashnode ⏳ Syncing
                        </span>
                      )
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-elevated, #131E2F)',
                          color: 'var(--text-tertiary, #718096)',
                          border: '1px solid var(--border, #1C2A3A)',
                        }}
                      >
                        Hashnode —
                      </span>
                    )}

                    {/* Hosted Site */}
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: isReady ? 'rgba(25, 215, 254, 0.12)' : 'var(--surface-elevated, #131E2F)',
                        color: isReady ? 'var(--axf-cyan, #19D7FE)' : 'var(--text-tertiary, #718096)',
                        border: isReady ? '1px solid rgba(25, 215, 254, 0.3)' : '1px solid var(--border, #1C2A3A)',
                      }}
                    >
                      Hosted Blog {isReady ? '✓ Live' : 'Draft'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
