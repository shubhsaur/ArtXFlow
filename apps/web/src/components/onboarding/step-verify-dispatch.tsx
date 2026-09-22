'use client';

import React from 'react';
import type { CanonicalSourceType } from './step-canonical-source';
import type { ConnectedDestinationsState } from './step-connect-destinations';
import { VerifyNextStepsRail } from './verify-next-steps-rail';

interface StepVerifyDispatchProps {
  workspaceName: string;
  workspaceSlug: string;
  canonicalSource: CanonicalSourceType;
  canonicalUrl: string;
  destinations: ConnectedDestinationsState;
  createSampleArticle: boolean;
  onCreateSampleArticleToggle: (val: boolean) => void;
}

export function StepVerifyDispatch({
  workspaceName,
  workspaceSlug,
  canonicalSource,
  canonicalUrl,
  destinations,
  createSampleArticle,
  onCreateSampleArticleToggle,
}: StepVerifyDispatchProps) {
  return (
    <div className="onboarding-split-grid" style={{ width: '100%' }}>
      {/* LEFT COLUMN: Verification & Pre-flight Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(18, 183, 106, 0.1)',
              border: '1px solid rgba(18, 183, 106, 0.3)',
              color: 'var(--status-success, #12B76A)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              marginBottom: '10px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              check_circle
            </span>
            <span>Setup Complete • Ready to Publish</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 6px 0',
            }}
          >
            You&apos;re all set to syndicate effortlessly
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Your workspace, canonical origin, and publishing destinations are securely configured and ready to go.
          </p>
        </div>

        {/* Configuration Review Card */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  border: '1px solid rgba(11, 98, 245, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--flow-cyan, #19D7FE)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  task_alt
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
                  Workspace Configuration Summary
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0' }}>
                  Everything verified and linked to your ArtXFlow account.
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(18, 183, 106, 0.1)',
                border: '1px solid rgba(18, 183, 106, 0.3)',
                color: 'var(--status-success, #12B76A)',
              }}
            >
              Ready
            </span>
          </div>

          {/* Specs Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Workspace */}
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-subtle, #172333)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary, #0B62F5)' }}>
                    corporate_fare
                  </span>
                  Workspace
                </span>
                <span style={{ color: 'var(--status-success, #12B76A)', fontWeight: 600 }}>Active</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', marginTop: '4px' }}>
                {workspaceName || 'My Workspace'}
              </span>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary, #AAB5C4)' }}>
                {workspaceSlug || 'workspace'}.artxflow.dev
              </span>
            </div>

            {/* Canonical Origin */}
            <div
              style={{
                padding: '14px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-subtle, #172333)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--flow-cyan, #19D7FE)' }}>
                    code_blocks
                  </span>
                  Canonical Source
                </span>
                <span style={{ color: 'var(--flow-cyan, #19D7FE)', fontWeight: 600 }}>
                  {canonicalSource === 'editor' ? 'Native Editor' : 'External Blog'}
                </span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', marginTop: '4px' }}>
                {canonicalSource === 'editor' ? 'ArtXFlow Hosted Site' : (canonicalUrl.trim() || 'Existing Blog Origin')}
              </span>
              <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary, #AAB5C4)' }}>
                {canonicalSource === 'editor' ? 'rel=canonical to hosted origin' : 'rel=canonical to your blog URL'}
              </span>
            </div>
          </div>

          {/* Connected Channels row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted, #66768D)', letterSpacing: '0.04em' }}>
              Connected Distribution Channels
            </span>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: '#000000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>
                  DEV
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>DEV.to</span>
                  <span style={{ fontSize: '10px', color: destinations.devtoConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)' }}>
                    {destinations.devtoConnected ? 'Ready' : 'Pending'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'rgba(11, 98, 245, 0.2)', color: 'var(--flow-cyan, #19D7FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800 }}>
                  HN
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Hashnode</span>
                  <span style={{ fontSize: '10px', color: destinations.hashnodeConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)' }}>
                    {destinations.hashnodeConnected ? 'Ready' : 'Pending'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: 'var(--surface-overlay, #111A28)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, fontFamily: 'serif' }}>
                  M
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Medium</span>
                  <span style={{ fontSize: '10px', color: destinations.mediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)' }}>
                    {destinations.mediumConnected ? 'Extension Paired' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Create First Sample Article Toggle */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid rgba(11, 98, 245, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(11, 98, 245, 0.2)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  post_add
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                    Create my first sample article
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(25, 215, 254, 0.15)',
                      color: 'var(--flow-cyan, #19D7FE)',
                    }}
                  >
                    Recommended
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                  Populate your workspace with a starter post to immediately test previewing and multi-platform dispatch.
                </p>
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '42px', height: '24px', flexShrink: 0, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={createSampleArticle}
                onChange={(e) => onCreateSampleArticleToggle(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: createSampleArticle ? 'var(--primary, #0B62F5)' : 'var(--surface-overlay, #111A28)',
                  border: '1px solid var(--border-default, #243447)',
                  borderRadius: '34px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: createSampleArticle ? '20px' : '3px',
                    bottom: '3px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%',
                    transition: '0.2s',
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: What Happens Next Guide */}
      <VerifyNextStepsRail />
    </div>
  );
}
