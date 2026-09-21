'use client';

import React from 'react';
import Link from 'next/link';

export function LandingCta() {
  return (
    <section
      style={{
        padding: '90px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
        <div
          className="hover-lift"
          style={{
            padding: 'clamp(40px, 6vw, 64px) clamp(20px, 4vw, 48px)',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid rgba(25, 215, 254, 0.3)',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(11, 98, 245, 0.2)',
          }}
        >
          {/* Subtle top accent gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--primary, #0B62F5), var(--flow-cyan, #19D7FE), var(--primary, #0B62F5))',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid rgba(25, 215, 254, 0.3)',
              marginBottom: '24px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'var(--flow-cyan, #19D7FE)',
              fontWeight: 600,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              rocket_launch
            </span>
            <span>GET STARTED IN 60 SECONDS</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 4.5vw, 44px)',
              fontWeight: 800,
              fontFamily: "'Geist', sans-serif",
              color: 'var(--text-primary, #F5F7FA)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}
          >
            Unleash your technical voice across the internet.
          </h2>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary, #AAB5C4)',
              maxWidth: '620px',
              margin: '0 auto 36px auto',
              lineHeight: 1.6,
            }}
          >
            Join creators and software engineers who author with canonical clarity and distribute to DEV.to, Hashnode, and Medium with zero SEO penalty.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}
          >
            <Link
              href="/login?mode=signup"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--primary, #0B62F5)',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(11, 98, 245, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Create Free Account</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </Link>

            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                color: 'var(--text-primary, #F5F7FA)',
                border: '1px solid var(--border-default, #243447)',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                login
              </span>
              <span>Sign In to Studio</span>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted, #66768D)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--status-success, #12B76A)' }}>✓</span>
              <span>No credit card required</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--status-success, #12B76A)' }}>✓</span>
              <span>Open-source MIT core</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--status-success, #12B76A)' }}>✓</span>
              <span>Automatic rel=canonical</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
