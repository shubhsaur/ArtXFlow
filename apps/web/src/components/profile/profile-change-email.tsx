'use client';

import React, { useState } from 'react';
import { ButtonSpinner } from '../button-spinner';
import { SecondaryButton } from '../secondary-button';

interface ProfileChangeEmailProps {
  currentEmail: string;
  onEmailChanged?: (newEmail: string) => void;
}

export function ProfileChangeEmail({ currentEmail, onEmailChanged }: ProfileChangeEmailProps) {
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setStatus('Email is required');
      return;
    }

    if (normalizedEmail === currentEmail.toLowerCase()) {
      setStatus('New email must be different from current email');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch('/api/user/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update email');
      }

      onEmailChanged?.(data.email);
      setShowModal(false);
      setNewEmail('');
      window.location.reload();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <SecondaryButton
        onClick={() => setShowModal(true)}
        style={{ padding: '4px 10px', fontSize: '12px' }}
      >
        Change Email
      </SecondaryButton>

      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Change Account Email
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
              Your current email is <strong>{currentEmail}</strong>. You will need to verify your new email after changing it.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new-email@example.com"
                required
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-default, #243447)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '14px',
                }}
              />

              {status && (
                <p style={{ fontSize: '12px', color: 'var(--status-error, #D92D20)', margin: 0 }}>
                  {status}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default, #243447)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary, #AAB5C4)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary, #0B62F5)',
                    border: '1px solid var(--primary, #0B62F5)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.8 : 1,
                  }}
                >
                  {isUpdating && <ButtonSpinner color="#FFFFFF" />}
                  <span>{isUpdating ? 'Updating...' : 'Update Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
