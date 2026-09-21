'use client';

import React from 'react';

export function VerifyNextStepsRail() {
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
              explore
            </span>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
              What happens next
            </h3>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>3 simple steps</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(11, 98, 245, 0.2)',
                color: 'var(--flow-cyan, #19D7FE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              1
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Write your first article
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                Draft directly with Markdown &amp; MDX, format code blocks, and preview across destinations.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(122, 92, 253, 0.15)',
                color: 'var(--flow-purple, #7A5CFD)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              2
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Preview platform formatting
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                Inspect how frontmatter, callouts, and code blocks render specifically for DEV.to, Hashnode, and Medium.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'rgba(18, 183, 106, 0.15)',
                color: 'var(--status-success, #12B76A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '1px',
              }}
            >
              3
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Publish to all targets in 1-click
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                Syndicate with canonical SEO tags guaranteed, automatic draft safety, and realtime sync status.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle, #172333)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            color: 'var(--text-muted, #66768D)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--flow-cyan, #19D7FE)' }}>
            verified
          </span>
          <span>Canonical URL injection & SEO protection are active on all dispatches.</span>
        </div>
      </div>
    </div>
  );
}
