'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@artxflow/ui';

interface OnboardingHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  onSaveAndExit?: () => void;
}

export function OnboardingHeader({
  userName,
  userEmail,
  onSaveAndExit,
}: OnboardingHeaderProps) {
  const router = useRouter();

  const displayName = userName?.trim() || userEmail?.split('@')[0] || 'Developer';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AR';

  const handleExit = () => {
    if (onSaveAndExit) {
      onSaveAndExit();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header
      role="banner"
      style={{
        height: '56px',
        width: '100%',
        backgroundColor: 'var(--surface-raised, #0D1420)',
        borderBottom: '1px solid var(--border-default, #243447)',
        padding: '0 clamp(16px, 3vw, 24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Setup Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
          aria-label="ArtXFlow Home"
        >
          <Logo size={24} showWordmark={true} />
        </Link>

        <div
          style={{
            height: '16px',
            width: '1px',
            backgroundColor: 'var(--border-default, #243447)',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--surface-base, #070B12)',
            border: '1px solid var(--border-subtle, #172333)',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-secondary, #AAB5C4)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-success, #12B76A)',
            }}
          />
          <span>Workspace Setup</span>
        </div>
      </div>

      {/* Utility Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <a
          href="/#docs"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-base, #070B12)',
            color: 'var(--text-secondary, #AAB5C4)',
            textDecoration: 'none',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            transition: 'all 0.15s ease',
          }}
          className="desktop-only-inline"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            menu_book
          </span>
          <span>Docs & Specs</span>
        </a>

        <button
          type="button"
          onClick={handleExit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-overlay, #111A28)',
            color: 'var(--text-secondary, #AAB5C4)',
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            save
          </span>
          <span>Save & Exit</span>
        </button>

        <div
          style={{
            height: '16px',
            width: '1px',
            backgroundColor: 'var(--border-default, #243447)',
          }}
        />

        {/* User Profile Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px 4px 4px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-base, #070B12)',
            border: '1px solid var(--border-subtle, #172333)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0B62F5 0%, #7A5CFD 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="desktop-only-inline">
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                lineHeight: 1.1,
              }}
            >
              {displayName}
            </span>
            {userEmail && (
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted, #66768D)',
                  lineHeight: 1.1,
                  marginTop: '1px',
                }}
              >
                {userEmail}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
