'use client';

import React, { useState } from 'react';
import type { SecurityTelemetry } from './profile-types';

interface ProfileSecurityCardProps {
  telemetry: SecurityTelemetry;
}

export function ProfileSecurityCard({ telemetry }: ProfileSecurityCardProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPasswordStatus('Password must be at least 8 characters.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update password');
      }
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      showNotification('Master fallback password updated successfully.');
    } catch (err: unknown) {
      setPasswordStatus(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid var(--border-subtle, #172333)',
  };

  const iconBoxStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    backgroundColor: 'var(--surface-container, #1C2027)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-subtle, #172333)',
    flexShrink: 0,
  };

  const actionBtnStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: 'var(--surface-base, #070B12)',
    border: '1px solid var(--border-default, #243447)',
    color: 'var(--text-secondary, #AAB5C4)',
    fontSize: '13px',
    cursor: 'pointer',
    flexShrink: 0,
  };

  return (
    <div className="profile-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 30,
            padding: '8px 14px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-container-high, #262A32)',
            border: '1px solid var(--flow-cyan, #19D7FE)',
            color: 'var(--flow-cyan, #19D7FE)',
            fontSize: '12px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="profile-card-header">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
            Security & Authentication
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', marginTop: '4px', marginBottom: 0 }}>
            Manage your single-sign-on identity and account credentials.
          </p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--text-muted, #66768D)', flexShrink: 0 }}>
          lock
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Row 1: Single Sign-On (if OAuth) */}
        {telemetry.ssoActive && telemetry.ssoProvider && (
          <div style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div style={{ ...iconBoxStyle, color: '#ffffff' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>key</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                  <span>Single Sign-On (SSO)</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-container-low, #171C23)',
                      border: '1px solid var(--border-default, #243447)',
                      color: 'var(--flow-cyan, #19D7FE)',
                    }}
                  >
                    Active
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', marginTop: '2px' }}>
                  Authenticated via{' '}
                  <strong style={{ color: '#ffffff', textTransform: 'capitalize' }}>
                    {telemetry.ssoProvider}
                  </strong>{' '}
                  OAuth (Account ID:{' '}
                  <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-primary, #F5F7FA)' }}>
                    {telemetry.ssoAccountId}
                  </code>
                  )
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Account Password */}
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ ...iconBoxStyle, color: '#ffffff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>password</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                Account Password
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', marginTop: '2px' }}>
                {telemetry.hasPassword
                  ? 'Protected with secure hashed credentials.'
                  : 'No password set. Your account is secured via your SSO identity provider.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            style={actionBtnStyle}
          >
            {telemetry.hasPassword ? 'Update Password' : 'Set Password'}
          </button>
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border-subtle, #172333)',
                paddingBottom: '12px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                Update Master Password
              </h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted, #66768D)', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {telemetry.hasPassword && (
                <div className="profile-form-control">
                  <label className="profile-label">Current Password</label>
                  <input
                    type="password"
                    required
                    className="profile-input-field"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              )}

              <div className="profile-form-control">
                <label className="profile-label">New Password (min 8 characters)</label>
                <input
                  type="password"
                  required
                  className="profile-input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {passwordStatus && (
                <p style={{ fontSize: '12px', color: 'var(--status-error, #D92D20)', margin: 0 }}>
                  {passwordStatus}
                </p>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
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
                  disabled={isUpdatingPassword}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--flow-blue, #0B87FE)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isUpdatingPassword ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
