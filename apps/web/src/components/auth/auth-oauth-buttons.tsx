'use client';

import React from 'react';

interface AuthOAuthButtonsProps {
  onSocialSignIn: (provider: 'github' | 'google') => void;
  loading: boolean;
}

export function AuthOAuthButtons({ onSocialSignIn, loading }: AuthOAuthButtonsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
      {/* GitHub OAuth */}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSocialSignIn('github')}
        style={{
          height: '42px',
          padding: '0 14px',
          borderRadius: '8px',
          backgroundColor: 'var(--surface-base, #070B12)',
          border: '1px solid var(--border-default, #243447)',
          color: 'var(--text-primary, #F5F7FA)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'Geist', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = 'var(--primary, #0B62F5)';
            e.currentTarget.style.backgroundColor = 'var(--surface-overlay, #111A28)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = 'var(--border-default, #243447)';
            e.currentTarget.style.backgroundColor = 'var(--surface-base, #070B12)';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
        <span>GitHub</span>
      </button>

      {/* Google OAuth */}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSocialSignIn('google')}
        style={{
          height: '42px',
          padding: '0 14px',
          borderRadius: '8px',
          backgroundColor: 'var(--surface-base, #070B12)',
          border: '1px solid var(--border-default, #243447)',
          color: 'var(--text-primary, #F5F7FA)',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: "'Geist', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = 'var(--border-highlight, rgba(11, 98, 245, 0.35))';
            e.currentTarget.style.backgroundColor = 'var(--surface-overlay, #111A28)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.currentTarget.style.borderColor = 'var(--border-default, #243447)';
            e.currentTarget.style.backgroundColor = 'var(--surface-base, #070B12)';
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            fill="#EA4335"
          />
          <path
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            fill="#4285F4"
          />
          <path
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
            fill="#FBBC05"
          />
          <path
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.4 7.5 23 12 23z"
            fill="#34A853"
          />
        </svg>
        <span>Google</span>
      </button>
    </div>
  );
}
