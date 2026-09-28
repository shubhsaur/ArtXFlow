'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo, Badge } from '@artxflow/ui';
import { UserDropdown } from './user-dropdown';

export interface AppHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
  organization: {
    id?: string;
    name: string;
  };
  membership: {
    role: string;
  };
}

export function AppHeader({ user, organization, membership }: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDashboardActive = pathname === '/dashboard';
  const isArticlesActive = pathname?.startsWith('/articles') ?? false;
  const isSettingsActive = pathname?.startsWith('/settings') ?? false;

  return (
    <header
      role="banner"
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        backgroundColor: 'var(--surface-raised, #0D1420)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 3vw, 24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Organization Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link
          href="/dashboard"
          aria-label="ArtXFlow Home"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Logo size={28} showWordmark={true} />
        </Link>

        {/* Desktop Organization Metadata */}
        <div
          className="app-header-brand-meta"
          style={{
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              height: '20px',
              width: '1px',
              backgroundColor: 'var(--border-subtle, #172333)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {organization.name}
            </span>
            <Badge variant="info">{membership.role}</Badge>
          </div>
        </div>
      </div>

      {/* Center Navigation Links (Desktop) */}
      <nav
        aria-label="Main Navigation"
        className="app-header-nav"
        style={{
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Link
          href="/dashboard"
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            color: isDashboardActive
              ? 'var(--text-primary, #F5F7FA)'
              : 'var(--text-secondary, #AAB5C4)',
            backgroundColor: isDashboardActive ? 'var(--surface-elevated, #131E2F)' : 'transparent',
            border: isDashboardActive
              ? '1px solid var(--border-default, #243447)'
              : '1px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Dashboard
        </Link>

        <Link
          href="/articles"
          style={{
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            color: isArticlesActive
              ? 'var(--text-primary, #F5F7FA)'
              : 'var(--text-secondary, #AAB5C4)',
            backgroundColor: isArticlesActive ? 'var(--surface-elevated, #131E2F)' : 'transparent',
            border: isArticlesActive
              ? '1px solid var(--border-default, #243447)'
              : '1px solid transparent',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
        >
          Articles
        </Link>
      </nav>

      {/* Trailing Cluster: User Dropdown & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <UserDropdown
          userName={user.name}
          userEmail={user.email}
          userImage={user.image}
          organizationName={organization.name}
          role={membership.role}
        />

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="app-mobile-toggle md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle App Menu"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #AAB5C4)',
            cursor: 'pointer',
            padding: '6px',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="app-mobile-drawer md:hidden"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(7, 11, 18, 0.98)',
            borderBottom: '1px solid var(--border-default, #243447)',
            padding: '16px 20px',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Organization & Role Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: 'var(--surface-overlay, #111a28)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, #172333)',
              marginBottom: '4px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted, #66768D)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                }}
              >
                Workspace
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {organization.name}
              </span>
            </div>
            <Badge variant="info">{membership.role}</Badge>
          </div>

          {/* Navigation Links */}
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              color: isDashboardActive
                ? 'var(--text-primary, #F5F7FA)'
                : 'var(--text-secondary, #AAB5C4)',
              backgroundColor: isDashboardActive
                ? 'var(--surface-elevated, #131E2F)'
                : 'transparent',
              border: isDashboardActive
                ? '1px solid var(--border-default, #243447)'
                : '1px solid transparent',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/articles"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              color: isArticlesActive
                ? 'var(--text-primary, #F5F7FA)'
                : 'var(--text-secondary, #AAB5C4)',
              backgroundColor: isArticlesActive
                ? 'var(--surface-elevated, #131E2F)'
                : 'transparent',
              border: isArticlesActive
                ? '1px solid var(--border-default, #243447)'
                : '1px solid transparent',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Articles</span>
          </Link>

          <Link
            href="/articles/new"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              color: 'var(--flow-cyan, #19D7FE)',
              backgroundColor: 'rgba(25, 215, 254, 0.08)',
              border: '1px solid rgba(25, 215, 254, 0.25)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ New Article</span>
          </Link>

          <div
            style={{
              borderTop: '1px solid var(--border-subtle, #172333)',
              marginTop: '4px',
              paddingTop: '8px',
            }}
          />

          <Link
            href="/settings"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '6px',
              color: isSettingsActive
                ? 'var(--text-primary, #F5F7FA)'
                : 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Workspace Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}
