'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@artxflow/ui';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle, #172333)',
        backgroundColor: 'var(--surface-base, #070B12)',
        color: 'var(--text-secondary, #AAB5C4)',
        padding: '64px clamp(16px, 4vw, 40px) 40px',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '48px',
        }}
      >
        {/* Brand & Mission */}
        <div style={{ maxWidth: '340px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Logo size={26} showWordmark={true} />
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: 'var(--surface-raised, #0D1420)',
                border: '1px solid var(--border-subtle, #172333)',
                color: 'var(--text-muted, #66768D)',
              }}
            >
              Open Source
            </span>
          </div>

          <p
            style={{
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-secondary, #AAB5C4)',
              marginBottom: '20px',
            }}
          >
            The open-source content distribution engine for technical creators. Author markdown once and syndicate
            deterministically with verified canonical SEO attribution.
          </p>

          {/* System Telemetry Status Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-primary, #F5F7FA)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success, #12B76A)',
                boxShadow: '0 0 8px var(--status-success, #12B76A)',
              }}
            />
            <span>All systems operational</span>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-primary, #F5F7FA)',
              marginBottom: '16px',
            }}
          >
            Product
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#features" style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}>
                Features & Pipeline
              </a>
            </li>
            <li>
              <a href="#adapters" style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}>
                Platform Adapters
              </a>
            </li>
            <li>
              <a href="#compare" style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}>
                Architecture Comparison
              </a>
            </li>
            <li>
              <Link href="/login" style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}>
                Workspace Console
              </Link>
            </li>
          </ul>
        </div>

        {/* Technical Specs */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-primary, #F5F7FA)',
              marginBottom: '16px',
            }}
          >
            Architecture
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)' }}>
                AST Markdown Rewriter
              </span>
            </li>
            <li>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Inngest Event Pipeline
              </span>
            </li>
            <li>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Drizzle ORM & Postgres
              </span>
            </li>
            <li>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)' }}>
                Canonical Attribution Audit
              </span>
            </li>
          </ul>
        </div>

        {/* Community & Legal */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-primary, #F5F7FA)',
              marginBottom: '16px',
            }}
          >
            Open Source
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a
                href="https://github.com/shubhsaur/ArtXFlow"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://github.com/shubhsaur/ArtXFlow/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--text-secondary, #AAB5C4)', textDecoration: 'none', fontSize: '14px' }}
              >
                MIT License
              </a>
            </li>
            <li>
              <span style={{ fontSize: '14px', color: 'var(--text-muted, #66768D)' }}>
                Next.js 15 & Turborepo
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Hairline & Legal Copyright */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle, #172333)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-muted, #66768D)',
        }}
      >
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} ArtXFlow. Open-source canonical content distribution engine.
        </p>
        <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
          Designed for precision infrastructure.
        </p>
      </div>
    </footer>
  );
}
