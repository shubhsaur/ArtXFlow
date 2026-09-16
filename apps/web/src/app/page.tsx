import React from 'react';
import Link from 'next/link';
import { Logo, Button } from '@artxflow/ui';

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-primary, #070B12)',
      }}
    >
      {/* Navigation Header */}
      <header
        role="banner"
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border, #1C2A3A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <Logo size={32} showWordmark={true} />
        <nav aria-label="Landing Navigation">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign In
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '48px 24px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full, 9999px)',
            backgroundColor: 'rgba(11, 135, 254, 0.1)',
            border: '1px solid rgba(11, 135, 254, 0.25)',
            color: 'var(--axf-cyan, #19D7FE)',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '24px',
          }}
        >
          <span>✦ Developer-first content distribution</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '20px',
          }}
        >
          Write once.{' '}
          <span
            style={{
              background:
                'var(--axf-gradient, linear-gradient(135deg, #0B87FE 0%, #19D7FE 45%, #7A5CFD 100%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Flow everywhere.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(16px, 2vw, 19px)',
            color: 'var(--text-secondary, #AAB5C4)',
            lineHeight: 1.6,
            maxWidth: '620px',
            marginBottom: '36px',
          }}
        >
          ArtXFlow is the canonical source of truth for technical articles. Author once and
          distribute seamlessly to DEV.to, Medium, Hashnode, and your own hosted publication.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login">
            <Button size="lg">Get Started Free →</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          borderTop: '1px solid var(--border, #1C2A3A)',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-secondary, #AAB5C4)',
        }}
      >
        © {new Date().getFullYear()} ArtXFlow. Open-source developer-first publishing platform.
      </footer>
    </div>
  );
}
