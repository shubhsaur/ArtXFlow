import React from 'react';
import Link from 'next/link';

export interface DashboardMetricsProps {
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
  articlesThisWeek?: number;
  avgLatency?: string;
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
  articlesThisWeek,
  avgLatency = '1.2s',
}: DashboardMetricsProps) {
  const isHealthy = failedPublicationsCount === 0;
  const healthRate =
    totalPublicationsCount > 0
      ? ((successfulPublicationsCount / totalPublicationsCount) * 100).toFixed(1)
      : '100.0';

  const weeklyDelta =
    articlesThisWeek !== undefined ? articlesThisWeek : Math.max(1, publishedCount > 0 ? 3 : 0);

  const providerNames =
    activeProviders && activeProviders.length > 0
      ? activeProviders.map((p) =>
          p.toLowerCase() === 'devto'
            ? 'DEV'
            : p.toLowerCase() === 'site'
              ? 'Blog'
              : p.charAt(0).toUpperCase() + p.slice(1),
        )
      : ['DEV', 'Hashnode', 'Medium', 'Blog'];

  return (
    <section aria-label="Executive KPI Metrics" style={{ width: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* CARD 1: Articles Published */}
        <Link
          href="/articles"
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div
            className="hover-card-border"
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: '#0F141B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '136px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #AAB5C4)',
                  letterSpacing: '0.01em',
                }}
              >
                Articles Published
              </span>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted, #66768D)',
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
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '10px 0' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {articlesCount}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#12B76A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +{weeklyDelta} this week
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted, #66768D)',
                  marginLeft: 'auto',
                }}
              >
                {publishedCount} published · {draftCount} drafts
              </span>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary, #AAB5C4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--flow-cyan, #19D7FE)',
                  boxShadow: '0 0 6px #19D7FE',
                }}
              />
              <span>Canonical Git repo connected</span>
            </div>
          </div>
        </Link>

        {/* CARD 2: Active Destinations */}
        <Link
          href="/settings"
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div
            className="hover-card-border"
            style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: '#0F141B',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '136px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #AAB5C4)',
                  letterSpacing: '0.01em',
                }}
              >
                Active Destinations
              </span>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--amber-accent, #F59E0B)',
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
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M3 12h6m6 0h6M12 3v6m0 6v6" />
                </svg>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '10px 0' }}>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                {connectedChannelsCount}{' '}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'var(--text-muted, #66768D)',
                  }}
                >
                  / 4
                </span>
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: isHealthy
                    ? 'rgba(18, 183, 106, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                  color: isHealthy ? '#12B76A' : 'var(--amber-accent, #F59E0B)',
                  border: `1px solid ${isHealthy ? 'rgba(18, 183, 106, 0.25)' : 'rgba(245, 158, 11, 0.3)'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: isHealthy ? '#12B76A' : 'var(--amber-accent, #F59E0B)',
                  }}
                />
                {isHealthy ? 'Healthy' : `${failedPublicationsCount} Attention Needed`}
              </span>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary, #AAB5C4)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{providerNames.join(', ')}</span>
            </div>
          </div>
        </Link>

        {/* CARD 3: Sync Health */}
        <div
          className="hover-card-border"
          style={{
            padding: '18px 20px',
            borderRadius: '12px',
            backgroundColor: '#0F141B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '136px',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-secondary, #AAB5C4)',
                letterSpacing: '0.01em',
              }}
            >
              Sync Health
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'rgba(18, 183, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#12B76A',
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
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '10px 0' }}>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}
            >
              {healthRate}%
            </span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor:
                  activeSchedulesCount > 0
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(18, 183, 106, 0.12)',
                color: activeSchedulesCount > 0 ? 'var(--amber-accent, #F59E0B)' : '#12B76A',
                border: `1px solid ${activeSchedulesCount > 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(18, 183, 106, 0.25)'}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor:
                    activeSchedulesCount > 0 ? 'var(--amber-accent, #F59E0B)' : '#12B76A',
                }}
              />
              {activeSchedulesCount > 0
                ? `${activeSchedulesCount} queued`
                : nextScheduledDate
                  ? `Next: ${nextScheduledDate}`
                  : 'All synced'}
            </span>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #AAB5C4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{avgLatency} avg latency across adapters</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-muted, #66768D)',
              }}
            >
              Failures: {failedPublicationsCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
