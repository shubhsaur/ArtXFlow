'use client';

import React from 'react';
import Image from 'next/image';

export function LandingHeroVisual() {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto 80px auto',
        padding: '0 clamp(16px, 3vw, 40px)',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Subtle outer glow backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: '0',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(25, 215, 254, 0.2) 0%, rgba(11, 98, 245, 0.3) 50%, rgba(245, 158, 11, 0.15) 100%)',
          filter: 'blur(30px)',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />

      {/* Terminal Window Container */}
      <div
        style={{
          position: 'relative',
          borderRadius: '10px',
          border: '1px solid var(--border-default, #243447)',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          overflow: 'hidden',
          boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Terminal Window Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: 'var(--surface-base, #070B12)',
            borderBottom: '1px solid var(--border-subtle, #172333)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
          }}
        >
          {/* Traffic lights + Process ID */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
            <span style={{ marginLeft: '8px', color: 'var(--text-secondary, #AAB5C4)', fontWeight: 500 }}>
              artxflow-core-dispatch.orchestrator
            </span>
          </div>

          {/* Telemetry pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--status-success, #12B76A)',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-success, #12B76A)',
                  boxShadow: '0 0 6px var(--status-success, #12B76A)',
                }}
              />
              ACTIVE PIPELINE
            </span>
            <span className="hidden sm:inline" style={{ color: 'var(--text-muted, #66768D)' }}>
              NODE_ENV=production
            </span>
          </div>
        </div>

        {/* Embedded High-Fidelity Product Visualization */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: 'var(--surface-base, #070B12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Image
            src="/assets/landing/editor-branching-visualization.png"
            alt="ArtXFlow Editor and Live Dual-Pane Syndication Pipeline"
            width={1376}
            height={768}
            priority
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
            }}
          />

          {/* Floating Telemetry Chips Overlay */}
          <div
            className="hidden md:flex"
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(17, 26, 40, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-highlight, rgba(11, 98, 245, 0.35))',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-primary, #F5F7FA)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>⚡</span>
              <span>Async Event Fan-out</span>
            </div>

            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(17, 26, 40, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--border-default, #243447)',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--status-success, #12B76A)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <span>🔒</span>
              <span>rel=canonical Enforced</span>
            </div>
          </div>

          <div
            className="hidden md:block"
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(17, 26, 40, 0.95)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--secondary-foreground-bright, #FBBF24)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--secondary, #F59E0B)',
                  boxShadow: '0 0 8px var(--secondary, #F59E0B)',
                }}
              />
              <span>Multi-Platform Synced • 100% rel=canonical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
