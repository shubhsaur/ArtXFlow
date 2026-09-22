'use client';

import React, { useState } from 'react';
import { Button } from '@artxflow/ui';

export interface EmailVerificationBannerProps {
  email: string;
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) {
    return null;
  }

  async function handleResend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          callbackURL: '/verify-email?status=success',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
      }

      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error sending email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="status"
      style={{
        width: '100%',
        backgroundColor: 'rgba(245, 158, 11, 0.12)',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
        color: '#FDE68A',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠️</span>
        <span>
          Your email (<strong>{email}</strong>) is not verified. Please verify it to ensure account recovery and unrestricted publishing.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {sent ? (
          <span style={{ color: '#10B981', fontWeight: 600 }}>
            ✓ Verification email sent!
          </span>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={handleResend}
            style={{
              fontSize: '12px',
              padding: '4px 10px',
              borderColor: 'rgba(245, 158, 11, 0.4)',
            }}
          >
            Resend Email
          </Button>
        )}

        {error && <span style={{ color: '#F87171', fontSize: '12px' }}>{error}</span>}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss email verification notice"
          style={{
            background: 'none',
            border: 'none',
            color: '#FDE68A',
            cursor: 'pointer',
            padding: '2px 6px',
            fontSize: '14px',
            opacity: 0.8,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
