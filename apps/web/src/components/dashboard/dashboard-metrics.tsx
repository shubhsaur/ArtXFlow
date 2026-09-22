import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@artxflow/ui';

interface DashboardMetricsProps {
  articlesCount: number;
  publishedCount: number;
  draftCount: number;
  connectedChannelsCount: number;
  activeProviders: string[]; // e.g. ['devto', 'medium', 'hashnode', 'site']
  totalPublicationsCount: number;
  successfulPublicationsCount: number;
  failedPublicationsCount: number;
  activeSchedulesCount: number;
  nextScheduledDate?: string | null;
}

export function DashboardMetrics({
  articlesCount,
  publishedCount,
  draftCount,
  connectedChannelsCount,
  activeProviders,
  totalPublicationsCount,
  successfulPublicationsCount,
  failedPublicationsCount,
  activeSchedulesCount,
  nextScheduledDate,
}: DashboardMetricsProps) {
  const isDevConnected = activeProviders.includes('devto');
  const isMediumConnected = activeProviders.includes('medium');
  const isHashnodeConnected = activeProviders.includes('hashnode');
  const isSiteActive = true; // Built-in ArtXFlow hosted site is always active

  return (
    <section
      aria-label="Executive KPI Metrics"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
      }}
    >
      {/* 1. Canonical Articles Card */}
      <Link href="/articles" style={{ textDecoration: 'none', display: 'block' }}>
        <Card className="hover-lift" style={{ height: '100%', cursor: 'pointer', backgroundColor: '#1F2937' }}>
          <CardHeader style={{ paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardDescription style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Canonical Articles
              </CardDescription>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(25, 215, 254, 0.1)',
                  color: 'var(--axf-cyan, #19D7FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
            </div>
            <CardTitle style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.03em' }}>
              {articlesCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {publishedCount} Published
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  color: '#FBBF24',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}
              >
                {draftCount} Drafts
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
              Immutable source of truth content library →
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 2. Connected Channels Card */}
      <Link href="/settings" style={{ textDecoration: 'none', display: 'block' }}>
        <Card className="hover-lift" style={{ height: '100%', cursor: 'pointer', backgroundColor: '#1F2937' }}>
          <CardHeader style={{ paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardDescription style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Connected Channels
              </CardDescription>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(11, 135, 254, 0.1)',
                  color: 'var(--axf-blue, #0B87FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
            </div>
            <CardTitle style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.03em' }}>
              {connectedChannelsCount}
              <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary, #AAB5C4)', marginLeft: '4px' }}>
                / 4
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Micro pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isDevConnected ? 'rgba(11, 135, 254, 0.15)' : 'var(--surface-elevated, #131E2F)',
                  color: isDevConnected ? '#60A5FA' : 'var(--text-tertiary, #718096)',
                  border: isDevConnected ? '1px solid rgba(11, 135, 254, 0.3)' : '1px solid var(--border, #1C2A3A)',
                  fontWeight: 600,
                }}
              >
                DEV.to {isDevConnected ? '✓' : '—'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isMediumConnected ? 'rgba(0, 171, 108, 0.15)' : 'var(--surface-elevated, #131E2F)',
                  color: isMediumConnected ? '#34D399' : 'var(--text-tertiary, #718096)',
                  border: isMediumConnected ? '1px solid rgba(0, 171, 108, 0.3)' : '1px solid var(--border, #1C2A3A)',
                  fontWeight: 600,
                }}
              >
                Medium {isMediumConnected ? '✓' : '—'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isHashnodeConnected ? 'rgba(41, 98, 255, 0.15)' : 'var(--surface-elevated, #131E2F)',
                  color: isHashnodeConnected ? '#93C5FD' : 'var(--text-tertiary, #718096)',
                  border: isHashnodeConnected ? '1px solid rgba(41, 98, 255, 0.3)' : '1px solid var(--border, #1C2A3A)',
                  fontWeight: 600,
                }}
              >
                Hashnode {isHashnodeConnected ? '✓' : '—'}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isSiteActive ? 'rgba(25, 215, 254, 0.15)' : 'var(--surface-elevated, #131E2F)',
                  color: isSiteActive ? 'var(--axf-cyan, #19D7FE)' : 'var(--text-tertiary, #718096)',
                  border: isSiteActive ? '1px solid rgba(25, 215, 254, 0.3)' : '1px solid var(--border, #1C2A3A)',
                  fontWeight: 600,
                }}
              >
                Blog ✓
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
              Manage destination tokens & accounts →
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 3. Cross-Platform Syndications */}
      <Link href="/articles" style={{ textDecoration: 'none', display: 'block' }}>
        <Card className="hover-lift" style={{ height: '100%', cursor: 'pointer', backgroundColor: '#1F2937' }}>
          <CardHeader style={{ paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardDescription style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Syndicated Publishes
              </CardDescription>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(122, 92, 253, 0.1)',
                  color: 'var(--axf-purple, #7A5CFD)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
            </div>
            <CardTitle style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.03em' }}>
              {totalPublicationsCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                }}
              >
                {successfulPublicationsCount} Live
              </span>
              {failedPublicationsCount > 0 ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    color: '#F87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {failedPublicationsCount} Attention Needed
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(25, 215, 254, 0.08)',
                    color: 'var(--axf-cyan, #19D7FE)',
                    border: '1px solid rgba(25, 215, 254, 0.2)',
                  }}
                >
                  100% Pipeline Health
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
              Independent destination projections →
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* 4. Scheduled Pipeline Card */}
      <Link href="/articles" style={{ textDecoration: 'none', display: 'block' }}>
        <Card className="hover-lift" style={{ height: '100%', cursor: 'pointer', backgroundColor: '#1F2937' }}>
          <CardHeader style={{ paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <CardDescription style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Scheduled Releases
              </CardDescription>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  color: '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <CardTitle style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px', letterSpacing: '-0.03em' }}>
              {activeSchedulesCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: '10px' }}>
              {activeSchedulesCount > 0 && nextScheduledDate ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(25, 215, 254, 0.1)',
                    color: 'var(--axf-cyan, #19D7FE)',
                    border: '1px solid rgba(25, 215, 254, 0.25)',
                    display: 'inline-block',
                  }}
                >
                  ⏰ Next: {nextScheduledDate}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'inline-block',
                  }}
                >
                  Worker Idle & Ready
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
              Inngest background cron queue →
            </p>
          </CardContent>
        </Card>
      </Link>
    </section>
  );
}
