'use client';

import React from 'react';
import Image from 'next/image';

export function LandingSeoProtection() {
  const snippets = [
    {
      platform: 'DEV.to Meta',
      code: 'canonical_url: https://yoursite.com/blog/a',
      color: 'var(--flow-cyan, #19D7FE)',
    },
    {
      platform: 'Hashnode GraphQL',
      code: 'isRepublished: { originalUrl: "https://yoursite.com/..." }',
      color: 'var(--primary, #0B62F5)',
    },
    {
      platform: 'Medium REST',
      code: 'canonicalUrl: "https://yoursite.com/blog/a"',
      color: 'var(--text-primary, #F5F7FA)',
    },
  ];

  return (
    <section
      style={{
        padding: '80px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Technical Narrative & Code Payloads */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--flow-cyan, #19D7FE)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '12px',
            }}
          >
            SEO Authority Guarantee
          </span>

          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 20px 0',
              lineHeight: 1.2,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Canonical Source of Truth with Strict{' '}
            <span style={{ color: 'var(--primary, #0B62F5)' }}>rel=canonical</span>
          </h2>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.65,
              marginBottom: '28px',
            }}
          >
            Google’s search algorithms heavily penalize duplicate technical content unless the canonical authority is
            strictly asserted. ArtXFlow forces every platform adapter to inject your primary blog post as the absolute
            canonical anchor.
          </p>

          {/* Payload Snippets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {snippets.map((s) => (
              <div
                key={s.platform}
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-raised, #0D1420)',
                  border: '1px solid var(--border-default, #243447)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <span style={{ color: 'var(--text-muted, #66768D)', fontWeight: 500 }}>{s.platform}:</span>
                <code style={{ color: s.color }}>{s.code}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Visual Diagram Image */}
        <div
          style={{
            position: 'relative',
            borderRadius: '10px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
          }}
        >
          <Image
            src="/assets/landing/syndication-attribution-engine.png"
            alt="Multi-Platform Syndication and Canonical SEO Attribution Engine"
            width={1376}
            height={768}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      </div>
    </section>
  );
}
