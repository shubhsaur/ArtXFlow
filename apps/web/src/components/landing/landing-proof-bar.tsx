'use client';

import React from 'react';

export function LandingProofBar() {
  const partners = [
    { name: 'DEV Community', icon: '◈' },
    { name: 'Hashnode', icon: '⬡' },
    { name: 'Medium', icon: '◎' },
    { name: 'Next.js Sites', icon: '▲' },
    { name: 'Markdown / MDX', icon: '◇' },
  ];

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto 64px auto',
        padding: '32px 24px 0 24px',
        borderTop: '1px solid var(--border-subtle, #172333)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted, #66768D)',
          marginBottom: '20px',
        }}
      >
        Engineered to syndicate across major developer platforms and modern publication frameworks
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(20px, 4vw, 48px)',
          opacity: 0.65,
        }}
      >
        {partners.map((p) => (
          <div
            key={p.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            <span style={{ fontSize: '14px', color: 'var(--text-muted, #66768D)' }}>{p.icon}</span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
