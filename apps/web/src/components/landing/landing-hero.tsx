'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function LandingHero() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('git clone https://github.com/shubhsaur/ArtXFlow.git');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(48px, 7vw, 84px) clamp(16px, 4vw, 40px) 40px',
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Background glow orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(90vw, 800px)',
          height: '420px',
          background: 'radial-gradient(ellipse at center, rgba(11, 98, 245, 0.18), rgba(25, 215, 254, 0.08) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Eyebrow Status Pill */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          color: 'var(--text-primary, #F5F7FA)',
          fontSize: '13px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 500,
          marginBottom: '28px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '8px',
            height: '8px',
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: 'var(--status-info, #0B62F5)',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              position: 'relative',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-info, #0B62F5)',
            }}
          />
        </span>
        <span>Open Source • Canonical Content Distribution Engine</span>
      </div>

      {/* Main Display Headline */}
      <h1
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 800,
          letterSpacing: '-0.035em',
          lineHeight: 1.08,
          color: 'var(--text-primary, #F5F7FA)',
          margin: '0 0 24px 0',
          maxWidth: '960px',
          fontFamily: "'Geist', sans-serif",
        }}
      >
        Write Once.{' '}
        <span className="brand-gradient-text" style={{ display: 'inline-block' }}>
          Flow Everywhere.
        </span>
      </h1>

      {/* Value Proposition Description */}
      <p
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 'clamp(16px, 2vw, 19px)',
          color: 'var(--text-secondary, #AAB5C4)',
          lineHeight: 1.6,
          maxWidth: '740px',
          margin: '0 0 36px 0',
          fontWeight: 400,
          fontFamily: "'Geist', sans-serif",
        }}
      >
        The open-source content distribution engine for technical creators. Author markdown once, preserve canonical
        SEO attribution, and syndicate deterministically across <strong>DEV.to, Hashnode, and Medium</strong>, with
        support for hosted personal publication sites.
      </p>

      {/* Primary Action Button Cluster */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <Link
          href="/login?mode=signup"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary, #0B62F5)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 600,
            padding: '13px 28px',
            borderRadius: '6px',
            textDecoration: 'none',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 24px -2px rgba(11, 98, 245, 0.45)',
            transition: 'all 0.15s ease',
          }}
          className="hover:brightness-110 active:scale-98"
        >
          <span>Get Started Free</span>
          <span style={{ fontSize: '16px' }}>→</span>
        </Link>

        <a
          href="https://github.com/shubhsaur/ArtXFlow"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            color: 'var(--text-primary, #F5F7FA)',
            fontSize: '15px',
            fontWeight: 500,
            padding: '13px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          className="hover:border-status-info hover:bg-surface-overlay active:scale-98"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Explore GitHub Repo</span>
        </a>
      </div>

      {/* Quick Copy CLI Widget */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '6px',
          backgroundColor: 'var(--surface-base, #070B12)',
          border: '1px solid var(--border-subtle, #172333)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          color: 'var(--text-secondary, #AAB5C4)',
        }}
      >
        <span style={{ color: 'var(--status-info, #0B62F5)', fontWeight: 700 }}>$</span>
        <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>git clone https://github.com/shubhsaur/ArtXFlow.git</span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy command"
          style={{
            background: 'none',
            border: 'none',
            color: copied ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}
          className="hover:text-text-primary"
        >
          {copied ? '✓' : '⧉'}
        </button>
      </div>
    </section>
  );
}
