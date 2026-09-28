'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  userName: string;
  organizationName: string;
  role: string;
  hasActiveSchedules?: boolean;
  onSyncAll?: () => void;
}

export function DashboardHeader({
  userName,
  organizationName,
  role,
  hasActiveSchedules = false,
  onSyncAll,
}: DashboardHeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncClick = () => {
    setIsSyncing(true);
    if (onSyncAll) {
      onSyncAll();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback('All destinations synced');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 1200);
  };

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '4px',
      }}
    >
      {/* Cluster Pill Bar (Responsive Mobile/Desktop indicator) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          backgroundColor: '#0F141B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#12B76A',
              boxShadow: '0 0 8px #12B76A',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            ArtXFlow / <strong style={{ color: '#F5F7FA' }}>{organizationName}</strong> · {role}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 500,
              color: hasActiveSchedules ? 'var(--flow-cyan, #19D7FE)' : '#12B76A',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: hasActiveSchedules ? 'var(--flow-cyan, #19D7FE)' : '#12B76A',
              }}
            />
            {hasActiveSchedules ? 'Scheduled releases queued' : 'Inngest pipeline operational'}
          </span>
        </div>
      </div>

      {/* Main Header Row: Title & Action Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#F5F7FA',
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              Overview
            </h1>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-muted, #66768D)',
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: '#141A23',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              v2.4
            </span>
          </div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Welcome back, {userName} · Unified multi-platform distribution and sync status.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleSyncClick}
            disabled={isSyncing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              backgroundColor: '#0F141B',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: isSyncing ? 'var(--flow-cyan, #19D7FE)' : '#DEE2ED',
              fontSize: '12px',
              fontWeight: 500,
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: isSyncing ? 'spin 1s linear infinite' : 'none',
              }}
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>{isSyncing ? 'Syncing...' : syncFeedback || 'Sync All Destinations'}</span>
          </button>

          <Link
            href="/settings"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: '#0F141B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <svg
              width="13"
              height="13"
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
            <span>Connect Channels</span>
          </Link>

          <Link
            href="/articles"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 12px',
              borderRadius: '8px',
              backgroundColor: '#0F141B',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <span>All Articles</span>
          </Link>

          <Link
            href="/articles/new"
            className="btn-gradient-primary"
            style={{
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
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
            <span>New Article</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
