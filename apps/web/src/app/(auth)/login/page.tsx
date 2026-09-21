'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { AuthBrandingPanel } from '@/components/auth/auth-branding-panel';
import { AuthMobileHeader } from '@/components/auth/auth-mobile-header';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--surface-base, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* LEFT PANEL: Brand, Mission & Distribution Engine Pipeline Preview (Desktop >= 860px) */}
      <div
        style={{
          width: '50%',
          height: '100%',
          flexShrink: 0,
        }}
        className="auth-desktop-panel"
      >
        <AuthBrandingPanel />
      </div>

      {/* RIGHT PANEL: Authentication Workspace */}
      <div
        style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(20px, 3vw, 40px)',
          position: 'relative',
        }}
      >
        {/* Top Meta Bar (Desktop & Tablet) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
          }}
        >
          {/* Back to Home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-secondary, #AAB5C4)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
              }}
            >
              <span>←</span>
              <span>Back to home</span>
            </Link>
          </div>

          {/* Help link */}
          <Link
            href="/#docs"
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 0.15s ease',
            }}
          >
            <span>Documentation</span>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Mobile Header (Rendered on mobile viewport only <= 860px) */}
        <div className="auth-mobile-header" style={{ flexDirection: 'column' }}>
          <AuthMobileHeader />
        </div>

        {/* Centered Modern Auth Form */}
        <div
          style={{
            margin: 'auto 0',
            padding: '16px 0',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                }}
              >
                Initializing workspace credentials...
              </div>
            }
          >
            <AuthForm />
          </Suspense>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle, #172333)',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '11px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-muted, #66768D)',
          }}
        >
          <div>
            <span>© 2026 ArtXFlow • Open Source Publishing Engine</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="https://github.com/shubhsaur/ArtXFlow"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--text-muted, #66768D)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #AAB5C4)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #66768D)')}
            >
              GitHub
            </a>
            <span>•</span>
            <Link
              href="/#docs"
              style={{ color: 'var(--text-muted, #66768D)', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #AAB5C4)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #66768D)')}
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
