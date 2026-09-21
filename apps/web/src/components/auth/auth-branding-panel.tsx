'use client';

import React from 'react';
import { Logo } from '@artxflow/ui';

export function AuthBrandingPanel() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(32px, 4vw, 48px)',
        position: 'relative',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderRight: '1px solid var(--border-subtle, #172333)',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Background Grids & Ambience */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />
      <div
        style={{
          position: 'absolute',
          top: '-80px',
          left: '-80px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          backgroundColor: 'rgba(11, 98, 245, 0.12)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          backgroundColor: 'rgba(122, 92, 253, 0.08)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Brand Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div>
          <Logo size={36} showWordmark={true} />
        </div>

        <div style={{ marginTop: '28px', maxWidth: '480px' }}>
          <h1
            style={{
              fontSize: 'clamp(28px, 3.5vw, 36px)',
              fontWeight: 700,
              fontFamily: "'Geist', sans-serif",
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #F5F7FA)',
              lineHeight: 1.15,
              margin: '0 0 10px 0',
            }}
          >
            Write once.<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #19D7FE 0%, #0B62F5 50%, #A855F7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Flow everywhere.
            </span>
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The open-source multi-destination distribution engine for engineering blogs, technical publications, and developer advocates.
          </p>
        </div>
      </div>

      {/* Center Dynamic Graphic: Branching Distribution Pipeline */}
      <div style={{ position: 'relative', zIndex: 1, margin: '24px 0' }}>
        <div
          style={{
            borderRadius: '12px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            padding: '18px',
            boxShadow: '0 12px 36px -8px rgba(11, 98, 245, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Live Pipeline Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--flow-cyan, #19D7FE)' }}>
                alt_route
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                  letterSpacing: '0.04em',
                }}
              >
                CANONICAL DISPATCH PIPELINE
              </span>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: 'var(--status-success, #12B76A)',
                backgroundColor: 'rgba(18, 183, 106, 0.12)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(18, 183, 106, 0.25)',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
              Multi-Platform Dispatch
            </span>
          </div>

          {/* Branching Nodes */}
          <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Source Node */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-overlay, #111A28)',
                border: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  border: '1px solid rgba(11, 98, 245, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--flow-cyan, #19D7FE)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  description
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                    canonical_spec.mdx
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                    AST Parsed
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <span>SHA: 9f4e82b</span>
                  <span>•</span>
                  <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Frontmatter Verified</span>
                </div>
              </div>
            </div>

            {/* Down Connector */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '-4px 0', color: 'var(--text-muted, #66768D)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                south
              </span>
            </div>

            {/* Destination Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary, #F5F7FA)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
                  DEV.to API
                </span>
                <span style={{ color: 'var(--text-muted, #66768D)' }}>Synced</span>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary, #F5F7FA)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
                  Hashnode GQL
                </span>
                <span style={{ color: 'var(--text-muted, #66768D)' }}>Synced</span>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary, #F5F7FA)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
                  Medium v1
                </span>
                <span style={{ color: 'var(--text-muted, #66768D)' }}>Canonical OK</span>
              </div>

              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary, #F5F7FA)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--flow-cyan, #19D7FE)' }} />
                  Public Site / Blog
                </span>
                <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Origin Source</span>
              </div>
            </div>
          </div>

          {/* Micro Terminal Stream */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>$</span>
              artxflow dispatch --all-targets --verify-seo
            </span>
            <span style={{ color: 'var(--status-success, #12B76A)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ✓ 0 errors
            </span>
          </div>
        </div>

        {/* Core Architectural Highlights */}
        <div
          style={{
            marginTop: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
                verified
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Canonical SEO</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', margin: 0, lineHeight: 1.4 }}>
              Automatic canonical URL injection protects origin search ranking.
            </p>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
                code_blocks
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Markdown &amp; MDX</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', margin: 0, lineHeight: 1.4 }}>
              AST-based syntax transformation tailored for each destination.
            </p>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
                history_toggle_off
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>Immutable Diffs</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', margin: 0, lineHeight: 1.4 }}>
              Audited version snapshots with cross-platform synchronization.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Architectural Badges */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle, #172333)',
          fontSize: '11px',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--text-muted, #66768D)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
            shield
          </span>
          <span>Better Auth</span>
        </div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
            lock
          </span>
          <span>Encrypted Credentials</span>
        </div>
        <span>•</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
            terminal
          </span>
          <span>Open Source (MIT)</span>
        </div>
      </div>
    </div>
  );
}
