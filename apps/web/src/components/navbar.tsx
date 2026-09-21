'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@artxflow/ui';
import { UserDropdown } from './user-dropdown';

export interface NavbarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  } | null;
  organizationName?: string | null;
  role?: string | null;
}

export function Navbar({ user, organizationName, role }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        const navbarHeight = 64;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', `#${targetId}`);
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        height: '64px',
        backgroundColor: isScrolled
          ? 'rgba(7, 11, 18, 0.92)'
          : 'rgba(7, 11, 18, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
        boxShadow: isScrolled ? '0 8px 24px -4px rgba(0, 0, 0, 0.45)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 clamp(16px, 3vw, 40px)',
        }}
      >
        {/* Brand Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/"
            style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
            aria-label="ArtXFlow Home"
          >
            <Logo size={28} showWordmark={true} />
          </Link>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
              color: 'var(--text-muted, #66768D)',
              letterSpacing: '0.02em',
            }}
          >
            Open Source
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Product Navigation"
          className="header-nav-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            className="nav-link"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            Features
          </a>
          <a
            href="/#adapters"
            onClick={(e) => handleNavClick(e, 'adapters')}
            className="nav-link"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            Adapters
          </a>
          <a
            href="/#compare"
            onClick={(e) => handleNavClick(e, 'compare')}
            className="nav-link"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            Compare
          </a>
          <a
            href="/#architecture"
            onClick={(e) => handleNavClick(e, 'architecture')}
            className="nav-link"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
            }}
          >
            Architecture
          </a>
        </nav>

        {/* Right Trailing Action Cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* GitHub Star Pill */}
          <a
            href="https://github.com/shubhsaur/ArtXFlow"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5"
            style={{
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ color: 'var(--secondary, #F59E0B)' }}>★</span>
            <span style={{ color: 'var(--text-primary, #F5F7FA)', fontWeight: 500 }}>GitHub</span>
          </a>

          {user ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #AAB5C4)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  transition: 'color 0.15s ease',
                }}
                className="hover:text-text-primary"
              >
                Dashboard
              </Link>
              <UserDropdown
                userName={user.name}
                userEmail={user.email}
                userImage={user.image}
                organizationName={organizationName || 'Workspace'}
                role={role || 'MEMBER'}
              />
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary, #AAB5C4)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  transition: 'color 0.15s ease',
                }}
                className="hover:text-text-primary"
              >
                Sign In
              </Link>

              {/* Primary Action Button */}
              <Link
                href="/login?mode=signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--primary, #0B62F5)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '7px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 16px -2px rgba(11, 98, 245, 0.35)',
                  transition: 'all 0.15s ease',
                }}
                className="hover:brightness-110 active:scale-95"
              >
                <span>Launch</span>
                <span style={{ fontSize: '14px', lineHeight: 1 }}>→</span>
              </Link>
            </>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              padding: '6px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="flex md:hidden"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(7, 11, 18, 0.98)',
            borderBottom: '1px solid var(--border-default, #243447)',
            padding: '16px 20px',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <a
            href="/#features"
            onClick={(e) => handleNavClick(e, 'features')}
            style={{
              color: 'var(--text-primary, #F5F7FA)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              padding: '6px 0',
            }}
          >
            Features
          </a>
          <a
            href="/#adapters"
            onClick={(e) => handleNavClick(e, 'adapters')}
            style={{
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              padding: '6px 0',
            }}
          >
            Adapters
          </a>
          <a
            href="/#compare"
            onClick={(e) => handleNavClick(e, 'compare')}
            style={{
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              padding: '6px 0',
            }}
          >
            Compare
          </a>
          <a
            href="/#architecture"
            onClick={(e) => handleNavClick(e, 'architecture')}
            style={{
              color: 'var(--text-secondary, #AAB5C4)',
              textDecoration: 'none',
              fontSize: '15px',
              fontWeight: 500,
              padding: '6px 0',
            }}
          >
            Architecture
          </a>
          <div style={{ borderTop: '1px solid var(--border-subtle, #172333)', paddingTop: '12px', display: 'flex', gap: '12px' }}>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default, #243447)',
                    color: 'var(--text-primary, #F5F7FA)',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary, #0B62F5)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-default, #243447)',
                    color: 'var(--text-primary, #F5F7FA)',
                    textDecoration: 'none',
                    fontSize: '14px',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary, #0B62F5)',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
