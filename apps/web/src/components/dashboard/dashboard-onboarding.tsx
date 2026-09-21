'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@artxflow/ui';

interface DashboardOnboardingProps {
  userId?: string;
  initialDismissed?: boolean;
  organizationName: string;
  hasConnectedPlatforms: boolean;
  hasArticles: boolean;
  hasPublications: boolean;
}

export function DashboardOnboarding({
  userId,
  initialDismissed = false,
  organizationName,
  hasConnectedPlatforms,
  hasArticles,
  hasPublications,
}: DashboardOnboardingProps) {
  const [isDismissed, setIsDismissed] = useState(initialDismissed);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync initial dismissal state from user-scoped session storage on mount
  useEffect(() => {
    if (initialDismissed) {
      setIsDismissed(true);
      return;
    }
    try {
      const sessionKey = userId
        ? `axf_dismiss_launchpad_session_${userId}`
        : 'axf_dismiss_launchpad_session';
      const sessionDismissed = sessionStorage.getItem(sessionKey) === 'true';
      if (sessionDismissed) {
        setIsDismissed(true);
      }
    } catch {
      // Storage access may be restricted in some iframe / incognito contexts
    }
  }, [initialDismissed, userId]);

  // Close popup on click outside or Escape key
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleDismissForNow = () => {
    setIsMenuOpen(false);
    setIsDismissed(true);
    try {
      const sessionKey = userId
        ? `axf_dismiss_launchpad_session_${userId}`
        : 'axf_dismiss_launchpad_session';
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const handleDismissPermanently = async () => {
    setIsMenuOpen(false);
    setIsDismissed(true);
    try {
      // Persist permanently in the database for this specific user account
      await fetch('/api/user/launchpad/dismiss', { method: 'POST' });
    } catch {
      // Non-blocking fallback
    }
  };

  // Calculate milestones
  const steps = [
    {
      id: 'workspace',
      title: 'Personal Workspace Initialized',
      description: `Organization tenant boundary "${organizationName}" configured.`,
      isDone: true,
      href: '/settings',
      ctaText: 'View Settings',
    },
    {
      id: 'platforms',
      title: 'Link Developer Publishing Platforms',
      description: 'Connect DEV.to, Medium, or Hashnode to enable cross-platform syndication.',
      isDone: hasConnectedPlatforms,
      href: '/settings',
      ctaText: 'Connect Channels',
    },
    {
      id: 'article',
      title: 'Draft Your First Canonical Article',
      description: 'Author your core article in Markdown with rich code blocks and canonical SEO tags.',
      isDone: hasArticles,
      href: '/articles/new',
      ctaText: 'Write Article',
    },
    {
      id: 'publish',
      title: 'Broadcast Cross-Platform Distribution',
      description: 'Trigger asynchronous Inngest workflows to project content across destinations.',
      isDone: hasPublications,
      href: '/articles',
      ctaText: 'Explore Articles',
    },
  ];

  const completedCount = steps.filter((s) => s.isDone).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // If user dismissed or completed all 4 steps, do not render
  if (isDismissed || completedCount === steps.length) {
    return null;
  }

  return (
    <Card
      style={{
        border: '1px solid rgba(25, 215, 254, 0.25)',
        backgroundColor: '#1F2937',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Decorative top accent gradient bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--axf-gradient, linear-gradient(135deg, #0B87FE 0%, #19D7FE 100%))',
          borderTopLeftRadius: 'var(--radius-lg, 12px)',
          borderTopRightRadius: 'var(--radius-lg, 12px)',
        }}
      />

      <CardHeader style={{ paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--axf-cyan, #19D7FE)',
                }}
              >
                Workspace Launchpad
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(25, 215, 254, 0.1)',
                  color: 'var(--axf-cyan, #19D7FE)',
                }}
              >
                {completedCount} of {steps.length} completed ({progressPercent}%)
              </span>
            </div>
            <CardTitle style={{ fontSize: '18px', fontWeight: 700 }}>
              Getting Started with Art<span className="axf-gradient-x">X</span>Flow
            </CardTitle>
            <CardDescription>
              Complete these steps to establish your single source of truth and syndicate across developer communities.
            </CardDescription>
          </div>

          {/* Close Menu Trigger & Dropdown */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Dismiss Workspace Launchpad"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid var(--border, #1C2A3A)',
                backgroundColor: isMenuOpen ? 'var(--surface-elevated, #131E2F)' : 'transparent',
                color: 'var(--text-secondary, #AAB5C4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated, #131E2F)';
                e.currentTarget.style.color = 'var(--text-primary, #F5F7FA)';
              }}
              onMouseLeave={(e) => {
                if (!isMenuOpen) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary, #AAB5C4)';
                }
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                close
              </span>
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '210px',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                  borderRadius: '8px',
                  padding: '6px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDismissForNow}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--axf-cyan, #19D7FE)' }}>
                    visibility_off
                  </span>
                  <span>Close it for now</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDismissPermanently}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary, #AAB5C4)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = '#F87171';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary, #AAB5C4)';
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    do_not_disturb_on
                  </span>
                  <span>Don&apos;t show this again</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: '6px',
            width: '100%',
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            borderRadius: '9999px',
            marginTop: '14px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--axf-blue, #0B87FE), var(--axf-cyan, #19D7FE))',
              borderRadius: '9999px',
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </CardHeader>

      <CardContent>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
          }}
        >
          {steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: step.isDone
                  ? 'rgba(16, 185, 129, 0.05)'
                  : 'var(--surface-elevated, #131E2F)',
                border: step.isDone
                  ? '1px solid rgba(16, 185, 129, 0.2)'
                  : '1px solid var(--border, #1C2A3A)',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: step.isDone
                        ? '#10B981'
                        : 'var(--border, #1C2A3A)',
                      color: step.isDone ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                      flexShrink: 0,
                    }}
                  >
                    {step.isDone ? '✓' : index + 1}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: step.isDone ? 'var(--text-primary, #F5F7FA)' : 'var(--text-primary, #F5F7FA)',
                      textDecoration: step.isDone ? 'none' : 'none',
                    }}
                  >
                    {step.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {step.description}
                </p>
              </div>

              <div>
                {step.isDone ? (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#34D399',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    Completed ✓
                  </span>
                ) : (
                  <Link href={step.href} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" style={{ width: '100%' }}>
                      {step.ctaText} →
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
