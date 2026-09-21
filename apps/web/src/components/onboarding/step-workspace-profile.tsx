'use client';

import React from 'react';

interface StepWorkspaceProfileProps {
  workspaceName: string;
  workspaceSlug: string;
  onWorkspaceNameChange: (val: string) => void;
  onWorkspaceSlugChange: (val: string) => void;
  isSlugAvailable?: boolean;
}

export function StepWorkspaceProfile({
  workspaceName,
  workspaceSlug,
  onWorkspaceNameChange,
  onWorkspaceSlugChange,
  isSlugAvailable = true,
}: StepWorkspaceProfileProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onWorkspaceNameChange(val);
    // If slug hasn't been heavily modified manually, auto-slugify
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (autoSlug) {
      onWorkspaceSlugChange(autoSlug);
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    onWorkspaceSlugChange(val);
  };

  return (
    <div className="onboarding-split-grid" style={{ width: '100%' }}>
      {/* LEFT COLUMN: Workspace Identity Configuration */}
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
              tune
            </span>
            <span>Initial Identity Setup</span>
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
            Create Your Publishing Workspace
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Configure your team identity, publishing domain slug, and syndication default rules.
          </p>
        </div>

        {/* Configuration Card */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Workspace Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="workspace-name"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Workspace Name</span>
              <span style={{ color: 'var(--primary, #0B62F5)' }}>*</span>
            </label>

            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: 'var(--text-muted, #66768D)',
                  pointerEvents: 'none',
                }}
              >
                corporate_fare
              </span>

              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={handleNameChange}
                placeholder="Developer Publications"
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  border: '1px solid var(--border-default, #243447)',
                  borderRadius: '8px',
                  padding: '0 36px 0 38px',
                  fontSize: '14px',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontFamily: "'Geist', sans-serif",
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
              />

              {workspaceName.trim() && (
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '18px',
                    color: 'var(--status-success, #12B76A)',
                    pointerEvents: 'none',
                  }}
                >
                  check_circle
                </span>
              )}
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
              The display name for your engineering workspace or blog publication.
            </span>
          </div>

          {/* Workspace Subdomain & Slug */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="workspace-slug"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Workspace Subdomain & Routing</span>
              <span style={{ color: 'var(--primary, #0B62F5)' }}>*</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  backgroundColor: 'var(--surface-overlay, #111A28)',
                  border: '1px solid var(--border-default, #243447)',
                  borderRight: 'none',
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-secondary, #AAB5C4)',
                  whiteSpace: 'nowrap',
                }}
              >
                artxflow.dev/
              </span>

              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="workspace-slug"
                  type="text"
                  value={workspaceSlug}
                  onChange={handleSlugChange}
                  placeholder="my-blog"
                  style={{
                    width: '100%',
                    height: '42px',
                    backgroundColor: 'var(--surface-base, #070B12)',
                    border: '1px solid var(--border-default, #243447)',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    padding: '0 85px 0 12px',
                    fontSize: '13px',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-primary, #F5F7FA)',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                />

                {workspaceSlug.trim() && (
                  <div
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isSlugAvailable
                        ? 'var(--status-success, #12B76A)'
                        : 'var(--status-error, #D92D20)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      {isSlugAvailable ? 'verified' : 'cancel'}
                    </span>
                    <span>{isSlugAvailable ? 'Available' : 'Taken'}</span>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                marginTop: '2px',
              }}
            >
              <span style={{ color: 'var(--flow-cyan, #19D7FE)', fontWeight: 600 }}>Custom domain:</span>
              <span style={{ color: 'var(--text-muted, #66768D)' }}>
                Can be linked and SSL-mapped anytime in workspace settings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Value Proposition & Telemetry Rail */}
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
          {/* Rail Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(11, 98, 245, 0.15)',
                border: '1px solid rgba(11, 98, 245, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--flow-cyan, #19D7FE)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                verified
              </span>
            </div>
            <div>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                  margin: 0,
                }}
              >
                What you get with ArtXFlow
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Zero configuration syndication
              </span>
            </div>
          </div>

          {/* Value points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  check
                </span>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  One canonical source of truth
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  Write once in your Git repo, headless CMS, or native markdown editor.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  check
                </span>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  Instant multi-platform syndication
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  Simultaneously broadcast to DEV.to, Medium, and Hashnode with 1-click.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(11, 98, 245, 0.15)',
                  color: 'var(--flow-cyan, #19D7FE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  check
                </span>
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  Automated SEO protection (rel=canonical)
                </span>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  Google and search engines always credit your primary hosted domain.
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
              tune
            </span>
            <span>Workspace details, domains, and custom settings can be updated anytime.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
