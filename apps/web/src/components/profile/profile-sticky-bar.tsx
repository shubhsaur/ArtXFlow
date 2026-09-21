'use client';

import React from 'react';

interface ProfileStickyBarProps {
  isDirty: boolean;
  isSaving: boolean;
  isValid: boolean;
  validationMessage?: string;
  onReset: () => void;
  onSave: () => void;
}

export function ProfileStickyBar({
  isDirty,
  isSaving,
  isValid,
  validationMessage = 'Profile inputs valid',
  onReset,
  onSave,
}: ProfileStickyBarProps) {
  return (
    <div
      style={{
        width: '100%',
        padding: '14px 20px',
        backgroundColor: 'rgba(13, 20, 32, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle, #172333)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        position: 'sticky',
        bottom: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        zIndex: 20,
      }}
    >
      {/* Left status indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-muted, #66768D)',
          fontSize: '13px',
          minWidth: 0,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: isValid
              ? 'var(--status-success, #12B76A)'
              : 'var(--status-error, #D92D20)',
            boxShadow: isValid
              ? '0 0 8px rgba(18, 183, 106, 0.5)'
              : '0 0 8px rgba(217, 45, 32, 0.5)',
          }}
        />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isValid ? validationMessage : 'Please resolve schema validation errors before saving'}
        </span>
      </div>

      {/* Right actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          marginLeft: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onReset}
          disabled={!isDirty || isSaving}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-base, #070B12)',
            border: '1px solid var(--border-default, #243447)',
            color: 'var(--text-secondary, #AAB5C4)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer',
            opacity: !isDirty || isSaving ? 0.5 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving || !isValid}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '6px',
            backgroundColor: 'var(--flow-blue, #0B87FE)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: !isDirty || isSaving || !isValid ? 'not-allowed' : 'pointer',
            opacity: !isDirty || isSaving || !isValid ? 0.5 : 1,
            boxShadow: '0 2px 10px rgba(11, 135, 254, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          {isSaving ? (
            <>
              <svg
                style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}
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
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                save
              </span>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
