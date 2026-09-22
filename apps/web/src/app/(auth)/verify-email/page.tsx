'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Logo, Button } from '@artxflow/ui';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  const [resendEmail, setResendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resendEmail,
          callbackURL: '/verify-email?status=success',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
      }

      setResendSent(true);
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : 'An error occurred while resending.');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'success') {
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '24px',
            color: '#10B981',
          }}
        >
          ✓
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
          Email Verified!
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #AAB5C4)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          Your email address has been confirmed. Your workspace is now verified and ready for multi-destination publishing.
        </p>

        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md" style={{ width: '100%' }}>
            Continue to Dashboard →
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
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '36px 28px',
        border: '1px solid var(--border, #1C2A3A)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '32px', marginBottom: '14px' }}>
          {error ? '⚠️' : '✉️'}
        </div>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '8px',
          }}
        >
          {error ? 'Verification link expired' : 'Verify your email'}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)', margin: 0, lineHeight: 1.5 }}>
          {error
            ? 'The verification link was invalid or has expired. Request a new link below.'
            : 'Please enter your email address to receive a fresh verification link.'}
        </p>
      </div>

      {resendError && (
        <div
          role="alert"
          style={{
            marginBottom: '18px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.35)',
            color: '#FCA5A5',
            fontSize: '13px',
          }}
        >
          ⚠️ {resendError}
        </div>
      )}

      {resendSent ? (
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10B981',
            fontSize: '14px',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          ✓ Verification email sent! Please check your inbox and spam folder.
        </div>
      ) : (
        <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="resend-email"
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
              id="resend-email"
              type="email"
              required
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="developer@domain.com"
              className="axf-input"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--surface, #0D1420)',
                border: '1px solid var(--border, #1C2A3A)',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <Button type="submit" loading={loading} variant="primary" size="md" style={{ width: '100%' }}>
            Resend Verification Link →
          </Button>
        </form>
      )}

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: '13px',
            color: 'var(--axf-cyan, #19D7FE)',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          ← Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <Link href="/dashboard" aria-label="ArtXFlow Home">
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
            <VerifyEmailContent />
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
