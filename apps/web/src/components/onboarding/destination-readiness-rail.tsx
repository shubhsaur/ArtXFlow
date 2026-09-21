'use client';

import React from 'react';
import type { ConnectedDestinationsState } from './step-connect-destinations';

interface DestinationReadinessRailProps {
  state: ConnectedDestinationsState;
}

export function DestinationReadinessRail({ state }: DestinationReadinessRailProps) {
  const readyCount = [
    state.devtoConnected,
    state.hashnodeConnected,
    state.mediumConnected,
  ].filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          borderRadius: '12px',
          padding: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--flow-cyan, #19D7FE)' }}>
              checklist
            </span>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
              Destination Setup
            </h3>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(18, 183, 106, 0.1)',
              border: '1px solid rgba(18, 183, 106, 0.3)',
              color: 'var(--status-success, #12B76A)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {readyCount} of 3 Ready
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: state.devtoConnected ? 'rgba(18, 183, 106, 0.2)' : 'var(--surface-raised, #0D1420)',
                  color: state.devtoConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                DEV Community
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: state.devtoConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
              }}
            >
              {state.devtoConnected ? 'Ready' : 'Pending'}
            </span>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: state.hashnodeConnected ? 'rgba(18, 183, 106, 0.2)' : 'var(--surface-raised, #0D1420)',
                  color: state.hashnodeConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                Hashnode
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: state.hashnodeConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
              }}
            >
              {state.hashnodeConnected ? 'Ready' : 'Pending'}
            </span>
          </div>

          <div
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: state.mediumConnected ? 'rgba(18, 183, 106, 0.2)' : 'var(--surface-raised, #0D1420)',
                  color: state.mediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                Medium
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: state.mediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
              }}
            >
              {state.mediumConnected ? 'Paired' : 'Pending'}
            </span>
          </div>
        </div>

        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle, #172333)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-muted, #66768D)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--flow-cyan, #19D7FE)', flexShrink: 0, marginTop: '2px' }}>
            verified
          </span>
          <span>Canonical URLs are automatically injected into all destination payloads to prevent SEO duplicate penalties.</span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-default, #243447)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-base, #070B12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary, #AAB5C4)',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            published_with_changes
          </span>
        </div>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', display: 'block' }}>
            Flexible Configuration
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
            Platforms and keys can be modified or disconnected anytime in settings.
          </span>
        </div>
      </div>
    </div>
  );
}
