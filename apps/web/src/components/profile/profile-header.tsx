'use client';

import React from 'react';

interface ProfileHeaderProps {
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export function ProfileHeader({
  isDirty,
  isSaving,
  onDiscard,
  onSave,
}: ProfileHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        paddingBottom: '20px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary, #F5F7FA)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Profile & Account
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary, #AAB5C4)',
            marginTop: '4px',
            marginBottom: 0,
          }}
        >
          Manage your author identity, canonical SEO origin URL, and account credentials.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onDiscard}
          disabled={!isDirty || isSaving}
          style={{
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            color: 'var(--text-secondary, #AAB5C4)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer',
            opacity: !isDirty || isSaving ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          Discard Changes
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--flow-blue, #0B87FE)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer',
            opacity: !isDirty || isSaving ? 0.5 : 1,
            boxShadow: '0 2px 8px rgba(11, 135, 254, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSaving ? (
            <>
              <svg
                style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                check_circle
              </span>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
