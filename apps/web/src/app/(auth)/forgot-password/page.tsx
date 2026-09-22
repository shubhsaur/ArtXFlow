'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@artxflow/ui';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectTo: '/reset-password',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to process password reset request.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '36px 28px',
          border: '1px solid var(--border, #1C2A3A)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(25, 215, 254, 0.12)',
            border: '1px solid rgba(25, 215, 254, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '24px',
          }}
        >
          ✉️
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '10px',
          }}
        >
          Check your email
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #AAB5C4)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          If an account exists with <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>, we have sent password reset instructions to your inbox.
        </p>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" style={{ width: '100%' }}>
            Back to Sign In →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '8px',
          }}
        >
          Reset your password
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)', margin: 0, lineHeight: 1.5 }}>
          Enter your registered email address and we will send you a secure link to reset your password.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '20px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.35)',
            color: '#FCA5A5',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '6px',
              color: 'var(--text-primary, #F5F7FA)',
            }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@domain.com"
            className="axf-input"
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border, #1C2A3A)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          variant="primary"
          size="lg"
          style={{ width: '100%', marginTop: '4px', padding: '12px' }}
        >
          Send Reset Link →
        </Button>
      </form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link
          href="/login"
          style={{
            fontSize: '13px',
            color: 'var(--axf-cyan, #19D7FE)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          ← Return to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-primary, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Drops & Grid */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
      <div className="glow-orb-cyan" style={{ top: '-120px', left: '20%', opacity: 0.4 }} />
      <div className="glow-orb-purple" style={{ bottom: '-150px', right: '20%', opacity: 0.3 }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(24px, 4vw, 48px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <Link href="/login" aria-label="ArtXFlow Home">
            <Logo size={32} showWordmark={true} />
          </Link>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Suspense fallback={<div style={{ color: 'var(--text-secondary)' }}>Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>
        </div>

        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-tertiary, #718096)',
            marginTop: '32px',
          }}
        >
          Open-source content distribution engine under MIT license.
        </div>
      </div>
    </div>
  );
}
