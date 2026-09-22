import React from 'react';
import Link from 'next/link';
import { Logo, Button } from '@artxflow/ui';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div className="glow-orb-cyan" style={{ top: '20%', left: '30%', opacity: 0.3 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
        <div style={{ marginBottom: '24px', display: 'inline-block' }}>
          <Logo size={40} showWordmark={true} />
        </div>

        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: '16px',
          }}
        >
          <span className="text-gradient">404</span>
        </div>

        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          Destination Not Found
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary, #AAB5C4)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The article, page, or publication route you are looking for has moved or does not exist.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link href="/">
            <Button variant="primary" size="md">
              Return Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="md">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
