import React from 'react';
import Link from 'next/link';
import { Button } from '@artxflow/ui';

interface DashboardHeaderProps {
  userName: string;
  organizationName: string;
  role: string;
  hasActiveSchedules?: boolean;
}

export function DashboardHeader({
  userName,
  organizationName,
  role,
  hasActiveSchedules = false,
}: DashboardHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        paddingBottom: '8px',
      }}
    >
      {/* User Greeting & Organization Context */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-primary, #F5F7FA)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Welcome back, {userName}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: 'rgba(25, 215, 254, 0.08)',
              color: 'var(--axf-cyan, #19D7FE)',
              border: '1px solid rgba(25, 215, 254, 0.25)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--axf-cyan, #19D7FE)',
                boxShadow: '0 0 8px var(--axf-cyan, #19D7FE)',
                display: 'inline-block',
              }}
            />
            {organizationName} · {role}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #AAB5C4)',
              margin: 0,
            }}
          >
            Real-time multi-destination content distribution and syndicate health.
          </p>

          <span
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
                backgroundColor: hasActiveSchedules ? 'var(--axf-cyan, #19D7FE)' : '#10B981',
                boxShadow: hasActiveSchedules
                  ? '0 0 8px var(--axf-cyan, #19D7FE)'
                  : '0 0 8px rgba(16, 185, 129, 0.6)',
              }}
            />
            {hasActiveSchedules ? 'Scheduled releases queued' : 'Inngest pipeline operational'}
          </span>
        </div>
      </div>

      {/* Quick Actions Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="md" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Connect Channels
          </Button>
        </Link>

        <Link href="/articles" style={{ textDecoration: 'none' }}>
          <Button variant="outline" size="md" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            All Articles
          </Button>
        </Link>

        <Link href="/articles/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Article
          </Button>
        </Link>
      </div>
    </header>
  );
}
