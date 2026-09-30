'use client';

import React from 'react';

export interface ArticlesHubMetricsProps {
  totalArticles: number;
  articlesThisWeek: number;
  syncedCount: number;
  syncedPercentage: number;
  draftCount: number;
  issuesCount: number;
}

export function ArticlesHubMetrics({
  totalArticles,
  articlesThisWeek,
  syncedCount,
  syncedPercentage,
  draftCount,
  issuesCount,
}: ArticlesHubMetricsProps) {
  return (
    <>
      {/* Desktop 4-Grid */}
      <section className="articles-metrics-desktop" style={{ width: '100%', minWidth: 0 }}>
        {/* Card 1: Total Canonical Articles */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted, #66768D)' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
              Total Canonical Articles
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-blue, #0B87FE)' }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', letterSpacing: '-0.02em' }}>
              {totalArticles}
            </span>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              ↑ +{articlesThisWeek} this week
            </span>
          </div>
          <div style={{ width: '100%', backgroundColor: 'var(--surface-container, #1B2027)', height: '4px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--flow-blue, #0B87FE)', height: '100%', width: totalArticles > 0 ? '80%' : '0%' }} />
          </div>
        </div>

        {/* Card 2: Synced Across Platforms */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted, #66768D)' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
              Synced Across Platforms
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--status-success, #12B76A)' }}>
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              <polyline points="9 11 12 14 22 4" />
            </svg>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', letterSpacing: '-0.02em' }}>
              {syncedCount}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--status-success, #12B76A)',
                backgroundColor: 'rgba(18, 183, 106, 0.1)',
                border: '1px solid rgba(18, 183, 106, 0.25)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {syncedPercentage}% delivery rate
            </span>
          </div>
          <div style={{ width: '100%', backgroundColor: 'var(--surface-container, #1B2027)', height: '4px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--status-success, #12B76A)', height: '100%', width: `${Math.min(100, syncedPercentage)}%` }} />
          </div>
        </div>

        {/* Card 3: In Draft / Local Engine */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted, #66768D)' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
              In Draft / Local Engine
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--status-warning, #F59E0B)' }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', letterSpacing: '-0.02em' }}>
              {draftCount}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#FBBF24',
                backgroundColor: 'rgba(69, 26, 3, 0.6)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              Local staging
            </span>
          </div>
          <div style={{ width: '100%', backgroundColor: 'var(--surface-container, #1B2027)', height: '4px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#F59E0B', height: '100%', width: totalArticles > 0 ? `${(draftCount / totalArticles) * 100}%` : '0%' }} />
          </div>
        </div>

        {/* Card 4: Sync Divergence / Alerts */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: issuesCount > 0 ? '1px solid rgba(217, 45, 32, 0.4)' : '1px solid var(--border-subtle, #172333)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted, #66768D)' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
              Sync Divergence / Alerts
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: issuesCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)' }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', letterSpacing: '-0.02em' }}>
              {issuesCount}
            </span>
            {issuesCount > 0 ? (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--status-error, #D92D20)',
                  backgroundColor: 'rgba(147, 0, 10, 0.25)',
                  border: '1px solid rgba(217, 45, 32, 0.4)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Requires review
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--status-success, #12B76A)',
                  backgroundColor: 'rgba(18, 183, 106, 0.1)',
                  border: '1px solid rgba(18, 183, 106, 0.25)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                All healthy
              </span>
            )}
          </div>
          <div style={{ width: '100%', backgroundColor: 'var(--surface-container, #1B2027)', height: '4px', borderRadius: '999px', marginTop: '12px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: issuesCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)', height: '100%', width: issuesCount > 0 ? '60%' : '100%' }} />
          </div>
        </div>
      </section>

      {/* Mobile 2x2 Compact Grid */}
      <section className="articles-metrics-mobile" style={{ width: '100%', minWidth: 0 }}>
        {/* Metric 1 */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '10px',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: 'var(--flow-blue, #0B87FE)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary, #AAB5C4)', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>Total Articles</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--flow-blue, #0B87FE)' }}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>{totalArticles}</span>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--flow-cyan, #19D7FE)' }}>+{articlesThisWeek} wk</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '10px',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: 'var(--status-success, #12B76A)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary, #AAB5C4)', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>Synced</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--status-success, #12B76A)' }}>
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>{syncedCount}</span>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)' }}>{syncedPercentage}%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-subtle, #172333)',
            borderRadius: '10px',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: '#F59E0B' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary, #AAB5C4)', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>Drafts</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#F59E0B' }}>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>{draftCount}</span>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: '#FBBF24' }}>staging</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: issuesCount > 0 ? '1px solid rgba(217, 45, 32, 0.4)' : '1px solid var(--border-subtle, #172333)',
            borderRadius: '10px',
            padding: '12px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: issuesCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary, #AAB5C4)', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>Issues</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: issuesCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>{issuesCount}</span>
            <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: issuesCount > 0 ? 'var(--status-error, #D92D20)' : 'var(--status-success, #12B76A)' }}>
              {issuesCount > 0 ? 'alerts' : 'healthy'}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
