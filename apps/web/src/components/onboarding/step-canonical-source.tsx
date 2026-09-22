'use client';

import React from 'react';

export type CanonicalSourceType = 'editor' | 'external';

interface StepCanonicalSourceProps {
  sourceType: CanonicalSourceType;
  onSourceTypeChange: (source: CanonicalSourceType) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (url: string) => void;
}

export function StepCanonicalSource({
  sourceType,
  onSourceTypeChange,
  canonicalUrl,
  onCanonicalUrlChange,
}: StepCanonicalSourceProps) {
  return (
    <div className="onboarding-split-grid" style={{ width: '100%' }}>
      {/* LEFT COLUMN: Source Selection */}
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
              database
            </span>
            <span>Step 2 Configuration</span>
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
            Choose Your Content Origin
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Select where your master articles originate. ArtXFlow automatically guarantees canonical SEO backlinks for every post.
          </p>
        </div>

        {/* Options list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* OPTION A: Built-in Editor (Recommended) */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSourceTypeChange('editor')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSourceTypeChange('editor');
              }
            }}
            style={{
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: sourceType === 'editor'
                ? 'var(--surface-raised, #0D1420)'
                : 'var(--surface-base, #070B12)',
              border: sourceType === 'editor'
                ? '2px solid var(--primary, #0B62F5)'
                : '1px solid var(--border-default, #243447)',
              boxShadow: sourceType === 'editor'
                ? '0 0 20px -3px rgba(11, 98, 245, 0.35)'
                : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(11, 98, 245, 0.15)',
                    border: '1px solid rgba(11, 98, 245, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--flow-cyan, #19D7FE)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    edit_note
                  </span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      ArtXFlow Built-in Editor
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        padding: '1px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(11, 98, 245, 0.15)',
                        border: '1px solid rgba(25, 215, 254, 0.3)',
                        color: 'var(--flow-cyan, #19D7FE)',
                      }}
                    >
                      Recommended
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      margin: '4px 0 0 0',
                      lineHeight: 1.4,
                    }}
                  >
                    Author directly in Markdown / MDX with instant live previews. Zero setup, webhook, or git configuration required.
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: sourceType === 'editor' ? 'var(--primary, #0B62F5)' : 'transparent',
                  border: sourceType === 'editor' ? 'none' : '2px solid var(--border-default, #243447)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {sourceType === 'editor' && (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    check
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: '14px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle, #172333)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--status-success, #12B76A)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                check_circle
              </span>
              <span>Ready immediately — write and syndicate your first article right after onboarding</span>
            </div>
          </div>

          {/* OPTION B: Existing Origin Blog or Custom Domain */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => onSourceTypeChange('external')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSourceTypeChange('external');
              }
            }}
            style={{
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: sourceType === 'external'
                ? 'var(--surface-raised, #0D1420)'
                : 'var(--surface-base, #070B12)',
              border: sourceType === 'external'
                ? '2px solid var(--primary, #0B62F5)'
                : '1px solid var(--border-default, #243447)',
              boxShadow: sourceType === 'external'
                ? '0 0 20px -3px rgba(11, 98, 245, 0.35)'
                : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--surface-overlay, #111A28)',
                    border: '1px solid var(--border-default, #243447)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--flow-cyan, #19D7FE)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    language
                  </span>
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--text-primary, #F5F7FA)',
                      margin: 0,
                    }}
                  >
                    Existing Origin Blog / Personal Site
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      margin: '4px 0 0 0',
                      lineHeight: 1.4,
                    }}
                  >
                    Use your existing personal or engineering publication as the canonical origin for search engines.
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: sourceType === 'external' ? 'var(--primary, #0B62F5)' : 'transparent',
                  border: sourceType === 'external' ? 'none' : '2px solid var(--border-default, #243447)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {sourceType === 'external' && (
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    check
                  </span>
                )}
              </div>
            </div>

            {/* External URL field if selected */}
            {sourceType === 'external' && (
              <div
                style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle, #172333)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <label htmlFor="origin-blog-url" style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)', fontFamily: "'JetBrains Mono', monospace" }}>
                  Origin Blog URL (Canonical SEO Destination)
                </label>
                <input
                  id="origin-blog-url"
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => onCanonicalUrlChange(e.target.value)}
                  placeholder="https://myblog.dev"
                  style={{
                    height: '38px',
                    backgroundColor: 'var(--surface-base, #070B12)',
                    border: '1px solid var(--border-default, #243447)',
                    borderRadius: '6px',
                    padding: '0 10px',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace",
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                  All syndicated posts on DEV.to, Hashnode, and Medium will link back to this URL.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Canonical SEO Explainer Rail */}
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
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(11, 98, 245, 0.15)',
              border: '1px solid rgba(25, 215, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--flow-cyan, #19D7FE)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
              verified_user
            </span>
          </div>

          <div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-primary, #F5F7FA)',
                margin: '0 0 6px 0',
              }}
            >
              Automated rel=canonical Injection
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary, #AAB5C4)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Every syndicated post sent to DEV.to, Hashnode, or Medium automatically includes a canonical header pointing back to your ArtXFlow hosted origin.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-subtle, #172333)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted, #66768D)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ color: 'var(--flow-cyan, #19D7FE)' }}>
              &lt;link rel=&quot;canonical&quot; href=&quot;{canonicalUrl.trim() || 'https://myblog.dev'}/posts/...&quot; /&gt;
            </div>
            <div style={{ color: 'var(--status-success, #12B76A)' }}>
              ✓ Search engines attribute 100% SEO authority to your origin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
