'use client';

import React from 'react';

export function LandingArchitectureCards() {
  return (
    <section
      style={{
        padding: '0 clamp(16px, 4vw, 40px) 80px',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Rate-Limit & Failure Recovery Card */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: 'var(--secondary, #F59E0B)' }}
                >
                  warning
                </span>
                <span
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 600,
                    fontSize: '16px',
                    color: 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  Backoff Queues &amp; Rate Limit Mitigation
                </span>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: 'var(--secondary, #F59E0B)',
                }}
              >
                Auto-Backoff
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #AAB5C4)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              DEV.to allows 30 requests/30 seconds; Medium restricts parallel writes. ArtXFlow workers orchestrate idempotent queues with exponential backoff and automatic per-destination retry on transient failures.
            </p>
          </div>

          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--surface-base, #070B12)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #172333)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ color: 'var(--secondary, #F59E0B)' }}>
              ▲ [429] Hashnode API throttled. Inngest sleep(60s)...
            </div>
            <div style={{ color: 'var(--status-success, #12B76A)' }}>
              ✓ [200] Resuming worker queue. Nonce re-validated.
            </div>
          </div>
        </div>

        {/* Asset Pipeline Card */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: 'var(--flow-cyan, #19D7FE)' }}
                >
                  imagesmode
                </span>
                <span
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 600,
                    fontSize: '16px',
                    color: 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  Asset Pipeline &amp; Edge CDN Acceleration
                </span>
              </div>
              <span
                style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  backgroundColor: 'rgba(25, 215, 254, 0.12)',
                  border: '1px solid rgba(25, 215, 254, 0.3)',
                  color: 'var(--flow-cyan, #19D7FE)',
                }}
              >
                Global WebP
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary, #AAB5C4)',
                lineHeight: 1.6,
                marginBottom: '20px',
              }}
            >
              Upload images via the Unsplash integration or direct upload. Images are stored in Cloudflare R2 / S3-compatible object storage and served optimally per destination platform.
            </p>
          </div>

          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--surface-base, #070B12)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #172333)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ color: 'var(--text-muted, #66768D)' }}>
              Original: <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>./assets/hero.png (4.2 MB)</span>
            </div>
            <div style={{ color: 'var(--flow-cyan, #19D7FE)' }}>
              Optimized: cdn.artxflow.dev/hero.webp (180 KB) [-95%]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
