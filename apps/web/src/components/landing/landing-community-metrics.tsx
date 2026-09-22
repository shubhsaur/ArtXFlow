'use client';

import React from 'react';

export function LandingCommunityMetrics() {
  const metrics = [
    { value: '100%', label: 'Open Source (MIT)', color: 'var(--text-primary, #F5F7FA)' },
    { value: '100%', label: 'rel=canonical SEO', color: 'var(--flow-cyan, #19D7FE)' },
    { value: '3+', label: 'Tech Platforms', color: 'var(--status-success, #12B76A)' },
    { value: '0', label: 'Duplicate Penalties', color: 'var(--secondary, #F59E0B)' },
  ];

  return (
    <section
      style={{
        padding: '80px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative' }}>
        <div
          className="glow-cobalt"
          style={{
            maxWidth: '860px',
            margin: '0 auto',
            padding: 'clamp(32px, 6vw, 56px) clamp(20px, 4vw, 48px)',
            borderRadius: '16px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              marginBottom: '24px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '15px', color: 'var(--secondary, #F59E0B)', fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <span>100% Free &amp; Open Source Under MIT License</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 700,
              fontFamily: "'Geist', sans-serif",
              color: 'var(--text-primary, #F5F7FA)',
              letterSpacing: '-0.025em',
              margin: '0 0 16px 0',
              lineHeight: 1.2,
            }}
          >
            Built in Public with the Developer Community
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            No vendor lock-in. No closed syndication silos. Join hundreds of technical authors and infrastructure developers shaping the future of decentralized technical writing.
          </p>

          {/* Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '16px',
              margin: '36px auto',
              maxWidth: '680px',
            }}
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    fontFamily: "'Geist', sans-serif",
                    color: m.color,
                    lineHeight: 1.1,
                  }}
                >
                  {m.value}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-muted, #66768D)',
                    marginTop: '6px',
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="https://github.com/shubhsaur/ArtXFlow"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--primary, #0B62F5)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(11, 98, 245, 0.35)',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>Star on GitHub (1.4k)</span>
            </a>

            <a
              href="#docs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                color: 'var(--text-primary, #F5F7FA)',
                border: '1px solid var(--border-default, #243447)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                terminal
              </span>
              <span>Explore Developer Docs</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
