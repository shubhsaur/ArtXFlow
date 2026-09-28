import React from 'react';

export interface ActivityEventItem {
  id: string;
  title: string;
  slug: string;
  status: 'SUCCESS' | 'IN_FLIGHT' | 'FAILED' | 'QUEUED';
  timestamp: string;
  latency?: string;
}

interface DashboardActivityFeedProps {
  events?: ActivityEventItem[];
}

export function DashboardActivityFeed({ events }: DashboardActivityFeedProps) {
  // Default activity events matching Stitch specification if none provided
  const displayEvents: ActivityEventItem[] =
    events && events.length > 0
      ? events.slice(0, 3)
      : [
          {
            id: 'ev-1',
            title: 'Hashnode GraphQL Synced',
            slug: '/blog/postgres-pooling-serverless',
            status: 'SUCCESS',
            timestamp: '14m ago',
            latency: '182ms',
          },
          {
            id: 'ev-2',
            title: 'Dispatching DEV.to Markdown',
            slug: '/blog/vector-embeddings-rust',
            status: 'IN_FLIGHT',
            timestamp: 'Now',
            latency: 'In flight',
          },
          {
            id: 'ev-3',
            title: 'ArtXFlow Hosted Blog Synced',
            slug: '/blog/event-driven-workers-inngest',
            status: 'SUCCESS',
            timestamp: '2h ago',
            latency: '94ms',
          },
        ];

  return (
    <section
      aria-label="Recent Activity Mini Feed"
      style={{
        padding: '16px 20px',
        borderRadius: '12px',
        backgroundColor: '#0F141B',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Feed Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '12px',
          marginBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--flow-cyan, #19D7FE)' }}
            aria-hidden="true"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#F5F7FA',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: 0,
            }}
          >
            Recent Activity
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#12B76A',
              boxShadow: '0 0 6px #12B76A',
            }}
          />
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary, #AAB5C4)',
              fontWeight: 500,
            }}
          >
            Live stream
          </span>
        </div>
      </div>

      {/* Grid of 3 Event Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
        }}
      >
        {displayEvents.map((event) => {
          const isSuccess = event.status === 'SUCCESS';
          const isInFlight = event.status === 'IN_FLIGHT';
          const isFailed = event.status === 'FAILED';

          return (
            <div
              key={event.id}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: isInFlight ? 'rgba(245, 158, 11, 0.05)' : '#0A0E15',
                border: isInFlight
                  ? '1px solid rgba(245, 158, 11, 0.25)'
                  : isFailed
                    ? '1px solid rgba(217, 45, 32, 0.25)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
              }}
            >
              {/* Event Dot Indicator */}
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  marginTop: '4px',
                  flexShrink: 0,
                  backgroundColor: isSuccess
                    ? '#12B76A'
                    : isInFlight
                      ? 'var(--amber-accent, #F59E0B)'
                      : isFailed
                        ? '#FFB4AB'
                        : '#0B87FE',
                  boxShadow: isSuccess
                    ? '0 0 6px #12B76A'
                    : isInFlight
                      ? '0 0 6px #F59E0B'
                      : 'none',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isInFlight ? 'var(--amber-accent, #F59E0B)' : '#DEE2ED',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.title}
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {event.slug}
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: isInFlight ? 'rgba(245, 158, 11, 0.85)' : 'var(--text-muted, #66768D)',
                    marginTop: '2px',
                  }}
                >
                  {event.timestamp} {event.latency ? `• ${event.latency}` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
