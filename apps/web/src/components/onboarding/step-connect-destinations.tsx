'use client';

import React, { useState } from 'react';
import { DestinationReadinessRail } from './destination-readiness-rail';
import { DestinationCardDevto } from './destination-card-devto';
import { DestinationCardHashnode } from './destination-card-hashnode';

export interface ConnectedDestinationsState {
  devtoConnected: boolean;
  devtoDraftMode: boolean;
  devtoToken: string;
  hashnodeConnected: boolean;
  hashnodeToken: string;
  hashnodeHandle: string;
  mediumConnected: boolean;
}

interface StepConnectDestinationsProps {
  state: ConnectedDestinationsState;
  onChange: (updater: (prev: ConnectedDestinationsState) => ConnectedDestinationsState) => void;
  onSaveToken: (provider: 'devto' | 'hashnode', token: string) => Promise<boolean>;
}

export function StepConnectDestinations({
  state,
  onChange,
  onSaveToken,
}: StepConnectDestinationsProps) {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnectDevto = async () => {
    if (!state.devtoToken.trim()) return;
    setConnectingProvider('devto');
    setErrorMessage(null);
    try {
      const ok = await onSaveToken('devto', state.devtoToken.trim());
      if (ok) {
        onChange((prev) => ({ ...prev, devtoConnected: true }));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect DEV.to');
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleConnectHashnode = async () => {
    if (!state.hashnodeToken.trim()) return;
    setConnectingProvider('hashnode');
    setErrorMessage(null);
    try {
      const ok = await onSaveToken('hashnode', state.hashnodeToken.trim());
      if (ok) {
        onChange((prev) => ({ ...prev, hashnodeConnected: true }));
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect Hashnode');
    } finally {
      setConnectingProvider(null);
    }
  };

  return (
    <div className="onboarding-step3-grid" style={{ width: '100%' }}>
      {/* LEFT COLUMN: Destination Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(11, 98, 245, 0.1)',
              border: '1px solid rgba(11, 98, 245, 0.3)',
              color: 'var(--flow-cyan, #19D7FE)',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              marginBottom: '10px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              bolt
            </span>
            <span>Multi-Platform Syndication</span>
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
            Connect Initial Publishing Destinations
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Select where you want your canonical articles syndicated. Connect your accounts now with API tokens, or configure anytime later.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(217, 45, 32, 0.1)',
              border: '1px solid rgba(217, 45, 32, 0.3)',
              color: '#F87171',
              fontSize: '13px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Platform 1: DEV Community */}
        <DestinationCardDevto
          state={state}
          connectingProvider={connectingProvider}
          onChange={onChange}
          onConnect={handleConnectDevto}
        />

        {/* Platform 2: Hashnode */}
        <DestinationCardHashnode
          state={state}
          connectingProvider={connectingProvider}
          onChange={onChange}
          onConnect={handleConnectHashnode}
        />

        {/* Platform 3: Medium */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: state.mediumConnected
              ? '1px solid rgba(18, 183, 106, 0.4)'
              : '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-overlay, #111A28)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary, #F5F7FA)',
                fontFamily: 'serif',
                fontWeight: 700,
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              M
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
                  Medium
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    padding: '1px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(122, 92, 253, 0.15)',
                    border: '1px solid rgba(122, 92, 253, 0.3)',
                    color: 'var(--flow-purple, #7A5CFD)',
                  }}
                >
                  Chrome Extension
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: '2px 0 0 0' }}>
                Seamless zero-token automated syndication via companion extension
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onChange((prev) => ({ ...prev, mediumConnected: !prev.mediumConnected }));
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: state.mediumConnected ? 'rgba(18, 183, 106, 0.15)' : 'var(--surface-base, #070B12)',
              border: state.mediumConnected ? '1px solid rgba(18, 183, 106, 0.4)' : '1px solid var(--border-default, #243447)',
              color: state.mediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-secondary, #AAB5C4)',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {state.mediumConnected ? 'check_circle' : 'extension'}
            </span>
            <span>{state.mediumConnected ? 'Extension Paired' : 'Pair Extension'}</span>
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', textAlign: 'center', margin: '4px 0 0 0' }}>
          Platform connections and publishing preferences can be managed anytime in Settings.
        </p>
      </div>

      {/* RIGHT COLUMN: Readiness & Status Rail */}
      <DestinationReadinessRail state={state} />
    </div>
  );
}
