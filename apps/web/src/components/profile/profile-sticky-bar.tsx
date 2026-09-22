'use client';

import React, { useState } from 'react';

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
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    if (isDirty) {
      setShowResetConfirm(true);
    } else {
      onReset();
    }
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    onReset();
  };

  return (
    <>
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
            onClick={handleResetClick}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.5 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            Reset to Default
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

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
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
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                Reset to Default
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary, #AAB5C4)',
                  marginTop: '8px',
                  marginBottom: 0,
                  lineHeight: 1.5,
                }}
              >
                This will discard all unsaved changes and restore your profile settings to their last saved state. Are you sure?
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: '8px 16px',
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
                onClick={confirmReset}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--status-error, #D92D20)',
                  backgroundColor: 'var(--status-error, #D92D20)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
