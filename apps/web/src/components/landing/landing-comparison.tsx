'use client';

import React from 'react';

export function LandingComparison() {
  return (
    <section
      id="features"
      style={{
        padding: '80px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderTop: '1px solid var(--border-subtle, #172333)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary, #0B62F5)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Deterministic Infrastructure
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 16px 0',
              lineHeight: 1.2,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            The High Cost of Manual Syndication vs. Canonical Flow
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Writing is only 40% of technical publishing. The rest is wasted on manual re-formatting, broken syntax
            blocks, missing canonical tags, and fractured revision drift.
          </p>
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1: The Broken Manual Method */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid rgba(217, 45, 32, 0.3)',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(217, 45, 32, 0.6)',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-error, #D92D20)', fontWeight: 600, fontSize: '15px' }}>
                <span>✕</span>
                <span>The Fragile Manual Cross-Posting Loop</span>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(217, 45, 32, 0.1)',
                  border: '1px solid rgba(217, 45, 32, 0.25)',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--status-error, #D92D20)',
                }}
              >
                ~45 mins / post
              </span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)', lineHeight: 1.6, marginBottom: '20px' }}>
              Copying rich markdown across disparate platform editors introduces catastrophic SEO regression and format decay:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.8)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle, #172333)',
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                <span style={{ color: 'var(--status-error, #D92D20)', fontWeight: 700 }}>✗</span>
                <span>Missing <code style={{ color: 'var(--text-primary, #F5F7FA)' }}>rel="canonical"</code> headers triggers Google duplicate content penalties</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.8)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle, #172333)',
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                <span style={{ color: 'var(--status-error, #D92D20)', fontWeight: 700 }}>✗</span>
                <span>Broken code block syntax highlighting &amp; stripped LaTeX math notation blocks</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.8)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle, #172333)',
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                <span style={{ color: 'var(--status-error, #D92D20)', fontWeight: 700 }}>✗</span>
                <span>Unsynced post-publish errata: edits fixed on your blog remain outdated on DEV &amp; Medium</span>
              </li>
            </ul>
          </div>

          {/* Card 2: The ArtXFlow Canonical Engine */}
          <div
            style={{
              borderRadius: '10px',
              border: '1px solid rgba(11, 98, 245, 0.45)',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 32px -6px rgba(11, 98, 245, 0.25)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '3px',
                backgroundColor: 'var(--primary, #0B62F5)',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--flow-cyan, #19D7FE)', fontWeight: 600, fontSize: '15px' }}>
                <span>✓</span>
                <span>The ArtXFlow Canonical Distribution Engine</span>
              </div>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  border: '1px solid rgba(11, 98, 245, 0.4)',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--primary, #0B62F5)',
                }}
              >
                Async Fan-out
              </span>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)', lineHeight: 1.6, marginBottom: '20px' }}>
              Treat your Markdown and canonical origin as the immutable single source of truth. Automated AST transforms handle target requirements natively:
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.9)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(11, 98, 245, 0.25)',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                <span style={{ color: 'var(--status-success, #12B76A)', fontWeight: 700 }}>✓</span>
                <span>Guaranteed <code style={{ color: 'var(--flow-cyan, #19D7FE)' }}>canonical_url</code> metadata injected across every platform API</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.9)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(11, 98, 245, 0.25)',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                <span style={{ color: 'var(--status-success, #12B76A)', fontWeight: 700 }}>✓</span>
                <span>Abstract Syntax Tree (AST) rewrites Markdown for DEV, Hashnode &amp; Medium schemas</span>
              </li>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'rgba(7, 11, 18, 0.9)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(11, 98, 245, 0.25)',
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                <span style={{ color: 'var(--status-success, #12B76A)', fontWeight: 700 }}>✓</span>
                <span>Single publish action propagates updates and errata across connected platforms idempotently</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
