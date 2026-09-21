'use client';

import React from 'react';
import type { OnboardingStep } from './onboarding-stepper';

interface OnboardingFooterProps {
  currentStep: OnboardingStep;
  onPrev: () => void;
  onNext: () => void;
  onSkip?: () => void;
  isSubmitting?: boolean;
}

const STEP_NEXT_LABELS: Record<OnboardingStep, string> = {
  1: 'Continue to Canonical Source',
  2: 'Continue to Connect Destinations',
  3: 'Continue to Verification & Launch',
  4: 'Launch Workspace & Start Writing',
};

const STEP_PREV_LABELS: Record<OnboardingStep, string> = {
  1: 'Back to Sign In',
  2: 'Back: Workspace Profile',
  3: 'Back: Canonical Source',
  4: 'Back: Connect Destinations',
};

export function OnboardingFooter({
  currentStep,
  onPrev,
  onNext,
  onSkip,
  isSubmitting = false,
}: OnboardingFooterProps) {
  const isLastStep = currentStep === 4;

  return (
    <footer
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
        width: '100%',
        backgroundColor: 'var(--surface-raised, #0D1420)',
        borderTop: '1px solid var(--border-default, #243447)',
        padding: '14px clamp(16px, 3vw, 24px)',
        boxShadow: '0 -8px 24px -4px rgba(0, 0, 0, 0.6)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Back Action */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            backgroundColor: 'var(--surface-base, #070B12)',
            border: '1px solid var(--border-default, #243447)',
            color: 'var(--text-secondary, #AAB5C4)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_back
          </span>
          <span>{STEP_PREV_LABELS[currentStep]}</span>
        </button>

        {/* Center: Reassurance or Skip option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLastStep ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted, #66768D)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--status-success, #12B76A)' }}>
                check
              </span>
              <span>Settings can be modified anytime in Workspace Settings</span>
            </div>
          ) : (
            onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #66768D)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  transition: 'color 0.15s ease',
                }}
              >
                Skip setup and go to dashboard
              </button>
            )
          )}
        </div>

        {/* Right: Primary Action CTA */}
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: isLastStep ? '10px 22px' : '9px 18px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary, #0B62F5)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            fontSize: isLastStep ? '14px' : '13px',
            fontWeight: 700,
            cursor: isSubmitting ? 'wait' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: isLastStep
              ? '0 0 24px -2px rgba(11, 98, 245, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 0 16px -2px rgba(11, 98, 245, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          <span>{isSubmitting ? 'Launching Workspace...' : STEP_NEXT_LABELS[currentStep]}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {isSubmitting ? 'refresh' : 'arrow_forward'}
          </span>
        </button>
      </div>
    </footer>
  );
}
