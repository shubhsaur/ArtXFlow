'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ProfileDeleteAccount() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete account');
      }
      router.push('/');
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="profile-card" style={{ marginTop: '24px', borderColor: 'var(--status-error, #D92D20)' }}>
      <div className="profile-card-header">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--status-error, #D92D20)', margin: 0 }}>
            Delete Account
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', marginTop: '4px', marginBottom: 0 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          backgroundColor: isHovered ? '#B91C1C' : 'var(--status-error, #D92D20)',
          border: '1px solid var(--status-error, #D92D20)',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        Delete Account
      </button>

      {showConfirm && (
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
          onClick={() => setShowConfirm(false)}
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
              Are you sure?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
              This will permanently delete your ArtXFlow account, articles, and all connected data. This action cannot be undone.
            </p>

            {status && (
              <p style={{ fontSize: '12px', color: 'var(--status-error, #D92D20)', margin: 0 }}>
                {status}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
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
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--status-error, #D92D20)',
                  border: '1px solid var(--status-error, #D92D20)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
