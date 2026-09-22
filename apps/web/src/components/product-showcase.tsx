'use client';

import React, { useState, useEffect } from 'react';
import { Button, Badge } from '@artxflow/ui';
import { PlatformIcon } from './platform-icons';

interface PlatformStatus {
  name: string;
  badgeColor: string;
  platformId: 'devto' | 'medium' | 'hashnode' | 'artxflow';
  status: 'published' | 'syncing' | 'ready';
  url: string;
  canonicalSet: boolean;
}

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<'editor' | 'flow' | 'analytics'>('flow');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-play demo simulation cycle
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev % 3) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const platforms: PlatformStatus[] = [
    {
      name: 'DEV.to',
      badgeColor: '#0B87FE',
      platformId: 'devto',
      status: 'published',
      url: 'dev.to/alexrivera/high-throughput-distributed-systems',
      canonicalSet: true,
    },
    {
      name: 'Medium',
      badgeColor: '#19D7FE',
      platformId: 'medium',
      status: 'published',
      url: 'medium.com/@alexrivera/high-throughput-distributed-systems',
      canonicalSet: true,
    },
    {
      name: 'Hashnode',
      badgeColor: '#7A5CFD',
      platformId: 'hashnode',
      status: 'published',
      url: 'alex.hashnode.dev/high-throughput-distributed-systems',
      canonicalSet: true,
    },
    {
      name: 'Personal Site',
      badgeColor: '#10B981',
      platformId: 'artxflow',
      status: 'published',
      url: 'blog.alexrivera.dev/posts/distributed-systems',
      canonicalSet: true,
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        borderRadius: 'var(--radius-xl, 16px)',
        border: '1px solid var(--border, #1C2A3A)',
        backgroundColor: 'var(--surface, #0D1420)',
        boxShadow: 'var(--card-shadow, 0 20px 40px -10px rgba(0,0,0,0.5))',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top Browser Chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border, #1C2A3A)',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
        }}
      >
        {/* macOS Traffic Lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#FF5F56',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#FFBD2E',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#27C93F',
              display: 'inline-block',
            }}
          />
        </div>

        {/* Browser URL Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--surface, #0D1420)',
            border: '1px solid var(--border, #1C2A3A)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono, monospace)',
            color: 'var(--text-secondary, #AAB5C4)',
            maxWidth: '440px',
            width: '100%',
            justifyContent: 'center',
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
            style={{ color: '#10B981' }}
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>https://app.artxflow.dev/articles/high-throughput-distributed-systems</span>
        </div>

        {/* Demo Mode Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="success">Live Product Demo</Badge>
        </div>
      </div>

      {/* Sub-Header Tabs & Simulation Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border, #1C2A3A)',
          backgroundColor: 'var(--surface-glass, rgba(13, 20, 32, 0.6))',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'flow' ? '1px solid var(--axf-blue)' : '1px solid transparent',
              backgroundColor:
                activeTab === 'flow' ? 'rgba(11, 135, 254, 0.15)' : 'transparent',
              color: activeTab === 'flow' ? 'var(--axf-cyan)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            ⚡ Multi-Destination Flow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'editor' ? '1px solid var(--axf-blue)' : '1px solid transparent',
              backgroundColor:
                activeTab === 'editor' ? 'rgba(11, 135, 254, 0.15)' : 'transparent',
              color: activeTab === 'editor' ? 'var(--axf-cyan)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            📝 Markdown & Dialects
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              border:
                activeTab === 'analytics' ? '1px solid var(--axf-blue)' : '1px solid transparent',
              backgroundColor:
                activeTab === 'analytics' ? 'rgba(11, 135, 254, 0.15)' : 'transparent',
              color: activeTab === 'analytics' ? 'var(--axf-cyan)' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            📊 Unified Analytics
          </button>
        </div>

        {/* Video / Flow Simulation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? '#10B981' : '#F59E0B',
                animation: isPlaying ? 'pulse-subtle 1.5s infinite' : 'none',
              }}
            />
            <span>Step {currentStep} of 3</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm, 6px)',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border, #1C2A3A)',
              color: 'var(--text-primary, #F5F7FA)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play Simulation'}
          </button>
        </div>
      </div>

      {/* Showcase Canvas Body */}
      <div
        style={{
          minHeight: '440px',
          padding: '28px',
          backgroundColor: 'var(--surface, #0D1420)',
          position: 'relative',
        }}
      >
        {/* TAB 1: DISTRIBUTION FLOW VISUALIZATION */}
        {activeTab === 'flow' && (
          <div>
            {/* Flow Header Banner */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '28px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border, #1C2A3A)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #F5F7FA)',
                    margin: 0,
                  }}
                >
                  Publishing Orchestration Pipeline
                </h4>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginTop: '2px',
                    margin: 0,
                  }}
                >
                  Source of Truth: Version 3.1 · 1,840 Words · All canonical tags synchronized
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="primary">
                  ⚡ Publish to All
                </Button>
              </div>
            </div>

            {/* Visual Node Graph */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
                position: 'relative',
              }}
            >
              {platforms.map((platform) => (
                <div
                  key={platform.name}
                  className="hover-lift"
                  style={{
                    padding: '18px',
                    borderRadius: 'var(--radius-lg, 12px)',
                    backgroundColor: 'var(--surface-elevated, #131E2F)',
                    border: '1px solid var(--border, #1C2A3A)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle top brand accent line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: platform.badgeColor,
                    }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: `${platform.badgeColor}25`,
                          color: platform.badgeColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${platform.badgeColor}40`,
                        }}
                      >
                        <PlatformIcon id={platform.platformId} size={16} color={platform.badgeColor} />
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          color: 'var(--text-primary, #F5F7FA)',
                        }}
                      >
                        {platform.name}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      ✓ Synced
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      color: 'var(--text-tertiary, #718096)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '12px',
                    }}
                  >
                    {platform.url}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      color: 'var(--axf-cyan, #19D7FE)',
                      backgroundColor: 'rgba(25, 215, 254, 0.08)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>Canonical: artxflow.dev</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Flow Stream Engine Status */}
            <div
              style={{
                marginTop: '24px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                  }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-primary, #F5F7FA)' }}>
                  Inngest Step Workflow: <strong>All 4 destinations acknowledged & validated</strong>
                </span>
              </div>
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                Execution latency: 1.28s
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: MARKDOWN & DIALECT TRANSLATION */}
        {activeTab === 'editor' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Source Editor Panel */}
            <div
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg, 12px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                <span style={{ fontWeight: 600 }}>SOURCE: Markdown + Frontmatter</span>
                <Badge variant="info">Canonical Authoring</Badge>
              </div>

              <pre
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '12px',
                  color: 'var(--text-primary, #F5F7FA)',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                  backgroundColor: 'var(--surface, #0D1420)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid var(--border-subtle, #142232)',
                }}
              >
                <code>{`---
title: "Building Resilient Event Streams"
published_at: 2026-09-19
tags: ["systemdesign", "typescript", "inngest"]
canonical_url: "https://artxflow.dev/@alex/event-streams"
---

# Building Resilient Event Streams

Distributed event workflows require idempotency,
automatic retries, and clean version tracking.

\`\`\`typescript
export const publishWorkflow = inngest.createFunction(
  { id: 'publish-article' },
  { event: 'article.publish.requested' },
  async ({ event, step }) => {
    // Flow across every destination
  }
);
\`\`\``}</code>
              </pre>
            </div>

            {/* Target Dialect Adapters */}
            <div
              style={{
                padding: '18px',
                borderRadius: 'var(--radius-lg, 12px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                <span style={{ fontWeight: 600 }}>AUTO-TRANSLATED DIALECTS</span>
                <Badge variant="success">Zero Manual Edits</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface, #0D1420)',
                    border: '1px solid var(--border-subtle, #142232)',
                    fontSize: '12px',
                  }}
                >
                  <strong style={{ color: '#0B87FE' }}>DEV.to Adapter:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Parsed frontmatter into DEV `series`, `tags` (max 4), and injected canonical header.
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface, #0D1420)',
                    border: '1px solid var(--border-subtle, #142232)',
                    fontSize: '12px',
                  }}
                >
                  <strong style={{ color: '#19D7FE' }}>Medium Adapter:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Converted GFM tables into responsive HTML blocks; set `canonicalUrl` via Medium REST API.
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface, #0D1420)',
                    border: '1px solid var(--border-subtle, #142232)',
                    fontSize: '12px',
                  }}
                >
                  <strong style={{ color: '#7A5CFD' }}>Hashnode Adapter:</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Prepared GraphQL payload, attached slug, cover photo, and publication tag array.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: UNIFIED ANALYTICS HUB */}
        {activeTab === 'analytics' && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Reach</div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                  }}
                >
                  38,420
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                  ↑ 42% vs single-platform publishing
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Total Reactions & Claps
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                  }}
                >
                  2,190
                </div>
                <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                  Across DEV.to, Medium, Hashnode
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg, 12px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Canonical SEO Authority
                </div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: 'var(--axf-cyan)',
                    marginTop: '4px',
                  }}
                >
                  100%
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  0 Duplicate Penalties
                </div>
              </div>
            </div>

            {/* Destination Breakdown Bar */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg, 12px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
              }}
            >
              <h5
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--text-primary)',
                }}
              >
                Audience Engagement by Destination
              </h5>
              <div
                style={{
                  height: '14px',
                  width: '100%',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--surface)',
                  display: 'flex',
                  overflow: 'hidden',
                  gap: '2px',
                }}
              >
                <div style={{ width: '40%', backgroundColor: '#0B87FE' }} title="DEV.to: 40%" />
                <div style={{ width: '30%', backgroundColor: '#19D7FE' }} title="Medium: 30%" />
                <div style={{ width: '20%', backgroundColor: '#7A5CFD' }} title="Hashnode: 20%" />
                <div style={{ width: '10%', backgroundColor: '#10B981' }} title="Personal Blog: 10%" />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  flexWrap: 'wrap',
                }}
              >
                <span>🔵 DEV.to (40%)</span>
                <span>💠 Medium (30%)</span>
                <span>🟣 Hashnode (20%)</span>
                <span>🟢 Personal Blog (10%)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
