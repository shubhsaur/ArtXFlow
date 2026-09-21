'use client';

import React from 'react';
import type { ConnectedDestinationsState } from './step-connect-destinations';

interface DestinationCardDevtoProps {
  state: ConnectedDestinationsState;
  connectingProvider: string | null;
  onChange: (updater: (prev: ConnectedDestinationsState) => ConnectedDestinationsState) => void;
  onConnect: () => void;
}

export function DestinationCardDevto({
  state,
  connectingProvider,
  onChange,
  onConnect,
}: DestinationCardDevtoProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised, #0D1420)',
        border: state.devtoConnected
          ? '1px solid rgba(18, 183, 106, 0.4)'
          : '1px solid var(--border-default, #243447)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#000000',
              border: '1px solid var(--border-default, #243447)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '14px',
              fontFamily: "'JetBrains Mono', monospace",
              flexShrink: 0,
            }}
          >
            DEV
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
                DEV Community
              </h3>
              {state.devtoConnected ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '1px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(18, 183, 106, 0.1)',
                    border: '1px solid rgba(18, 183, 106, 0.3)',
                    color: 'var(--status-success, #12B76A)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#12B76A' }} />
                  Connected
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                  Ready to Connect
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: '2px 0 0 0' }}>
              Publishes canonical markdown to dev.to
            </p>
          </div>
        </div>

        <a
          href="https://dev.to/settings/extensions"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '12px',
            color: 'var(--flow-cyan, #19D7FE)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>Get Token</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            open_in_new
          </span>
        </a>
      </div>

      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle, #172333)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px' }}>
          <input
            type="password"
            value={state.devtoToken}
            onChange={(e) => {
              const val = e.target.value;
              onChange((prev) => ({ ...prev, devtoToken: val }));
            }}
            placeholder={state.devtoConnected ? 'dev_tok_••••••••••••' : 'Paste DEV.to API Token (dev_tok_...)'}
            style={{
              width: '100%',
              height: '38px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '6px',
              padding: '0 12px',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
            }}
          />
        </div>

        <button
          type="button"
          onClick={onConnect}
          disabled={connectingProvider === 'devto' || !state.devtoToken.trim()}
          style={{
            height: '38px',
            padding: '0 16px',
            borderRadius: '6px',
            backgroundColor: state.devtoConnected ? 'var(--surface-overlay, #111A28)' : 'var(--primary, #0B62F5)',
            border: '1px solid var(--border-default, #243447)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            cursor: state.devtoToken.trim() ? 'pointer' : 'default',
            opacity: state.devtoToken.trim() ? 1 : 0.6,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            {state.devtoConnected ? 'check' : 'link'}
          </span>
          <span>{state.devtoConnected ? 'Update' : 'Connect'}</span>
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-secondary, #AAB5C4)',
            cursor: 'pointer',
            userSelect: 'none',
            marginLeft: 'auto',
          }}
        >
          <input
            type="checkbox"
            checked={state.devtoDraftMode}
            onChange={(e) => {
              const val = e.target.checked;
              onChange((prev) => ({ ...prev, devtoDraftMode: val }));
            }}
            style={{ cursor: 'pointer' }}
          />
          <span>Draft mode</span>
        </label>
      </div>
    </div>
  );
}
