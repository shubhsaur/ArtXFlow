'use client';

import React from 'react';

export type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingStepperProps {
  currentStep: OnboardingStep;
  completedSteps: number[];
  onSelectStep: (step: OnboardingStep) => void;
}

interface StepMeta {
  step: OnboardingStep;
  title: string;
  shortTitle: string;
}

const STEPS: StepMeta[] = [
  { step: 1, title: 'Workspace Profile', shortTitle: 'Workspace' },
  { step: 2, title: 'Canonical Source', shortTitle: 'Source' },
  { step: 3, title: 'Connect Destinations', shortTitle: 'Destinations' },
  { step: 4, title: 'Verify & Dispatch', shortTitle: 'Launch' },
];

export function OnboardingStepper({
  currentStep,
  completedSteps,
  onSelectStep,
}: OnboardingStepperProps) {
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ width: '100%', marginBottom: '24px' }}>
      {/* DESKTOP STEPPER RIBBON (> 900px) */}
      <div
        className="onboarding-stepper-desktop"
        style={{
          width: '100%',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          borderRadius: '12px',
          padding: '14px 18px',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          position: 'relative',
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Glow ambient background filament */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '380px',
            height: '40px',
            background: 'rgba(11, 98, 245, 0.15)',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />

        {STEPS.map((meta) => {
          const isCompleted = completedSteps.includes(meta.step) && currentStep > meta.step;
          const isActive = currentStep === meta.step;
          const isClickable = isCompleted || meta.step <= Math.max(...completedSteps, 1);

          return (
            <button
              key={meta.step}
              type="button"
              onClick={() => isClickable && onSelectStep(meta.step)}
              disabled={!isClickable}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                backgroundColor: isActive
                  ? 'var(--surface-overlay, #111A28)'
                  : isCompleted
                  ? 'rgba(18, 183, 106, 0.06)'
                  : 'var(--surface-base, #070B12)',
                border: isActive
                  ? '1px solid var(--primary, #0B62F5)'
                  : isCompleted
                  ? '1px solid rgba(18, 183, 106, 0.3)'
                  : '1px solid var(--border-subtle, #172333)',
                boxShadow: isActive ? '0 0 16px -2px rgba(11, 98, 245, 0.4)' : 'none',
                opacity: !isActive && !isCompleted ? 0.65 : 1,
              }}
            >
              {/* Step indicator circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  backgroundColor: isCompleted
                    ? 'rgba(18, 183, 106, 0.15)'
                    : isActive
                    ? 'var(--primary, #0B62F5)'
                    : 'var(--surface-raised, #0D1420)',
                  border: isCompleted
                    ? '1px solid rgba(18, 183, 106, 0.4)'
                    : isActive
                    ? '1px solid #19D7FE'
                    : '1px solid var(--border-default, #243447)',
                  color: isCompleted
                    ? 'var(--status-success, #12B76A)'
                    : isActive
                    ? '#FFFFFF'
                    : 'var(--text-muted, #66768D)',
                }}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    check
                  </span>
                ) : (
                  meta.step
                )}
              </div>

              {/* Step Title & Subtitle */}
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: isActive
                        ? 'var(--flow-cyan, #19D7FE)'
                        : isCompleted
                        ? 'var(--status-success, #12B76A)'
                        : 'var(--text-muted, #66768D)',
                    }}
                  >
                    {isCompleted
                      ? `Step ${meta.step} • Completed`
                      : isActive
                      ? `Step ${meta.step} of 4`
                      : `Step ${meta.step} • Pending`}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--flow-cyan, #19D7FE)',
                        boxShadow: '0 0 6px var(--flow-cyan, #19D7FE)',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive || isCompleted
                      ? 'var(--text-primary, #F5F7FA)'
                      : 'var(--text-secondary, #AAB5C4)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {meta.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MOBILE COMPACT STEPPER (<= 900px) */}
      <div
        className="onboarding-stepper-mobile"
        style={{
          width: '100%',
          flexDirection: 'column',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          borderRadius: '10px',
          padding: '12px 16px',
          gap: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {STEPS.map((meta) => {
            const isCompleted = completedSteps.includes(meta.step) && currentStep > meta.step;
            const isActive = currentStep === meta.step;
            return (
              <div
                key={meta.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isActive || isCompleted ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: isCompleted
                      ? 'var(--status-success, #12B76A)'
                      : isActive
                      ? 'var(--primary, #0B62F5)'
                      : 'var(--surface-base, #070B12)',
                    border: '1px solid var(--border-default, #243447)',
                    color: '#FFFFFF',
                  }}
                >
                  {isCompleted ? '✓' : meta.step}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: isActive
                      ? 'var(--flow-cyan, #19D7FE)'
                      : isCompleted
                      ? 'var(--status-success, #12B76A)'
                      : 'var(--text-muted, #66768D)',
                  }}
                >
                  {meta.shortTitle}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Track */}
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--surface-base, #070B12)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.max(progressPercent, 25)}%`,
              background: 'linear-gradient(90deg, var(--primary, #0B62F5), var(--flow-cyan, #19D7FE))',
              borderRadius: '9999px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
