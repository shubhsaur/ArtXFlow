'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface UserDropdownProps {
  userName?: string | null;
  userEmail: string;
  userImage?: string | null;
  organizationName: string;
  role: string;
}

function getInitials(name?: string | null, email?: string): string {
  const target = name?.trim() || email?.split('@')[0] || '?';
  const parts = target.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserDropdown({
  userName,
  userEmail,
  userImage,
  organizationName,
  role,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName = userName || userEmail.split('@')[0];
  const initials = getInitials(userName, userEmail);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch {
      window.location.href = '/login';
    } finally {
      setIsSigningOut(false);
      setIsOpen(false);
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User navigation menu"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 8px 4px 6px',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid',
          borderColor: isOpen ? 'var(--border-highlight, rgba(25, 215, 254, 0.4))' : 'transparent',
          backgroundColor: isOpen ? 'var(--surface-elevated, #131E2F)' : 'transparent',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'var(--border, #1C2A3A)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }
        }}
      >
        {/* User Avatar Circle */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            border: '1px solid var(--border, #1C2A3A)',
            color: 'var(--text-primary, #F5F7FA)',
            fontSize: '11px',
            fontWeight: 600,
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          {userImage && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userImage}
              alt={displayName}
              onError={() => setImageError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-primary, #F5F7FA)',
            maxWidth: '140px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>

        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            color: 'var(--text-secondary, #AAB5C4)',
            transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '240px',
            backgroundColor: 'var(--surface-elevated, #0D1420)',
            backgroundImage: 'linear-gradient(180deg, rgba(19, 30, 47, 0.96) 0%, rgba(13, 20, 32, 0.98) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border, #1C2A3A)',
            borderRadius: 'var(--radius-lg, 12px)',
            boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
            padding: '6px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'axf-field-error-enter 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header with User & Organization details */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid var(--border, #1C2A3A)',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-primary, #F5F7FA)',
                lineHeight: 1.3,
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary, #AAB5C4)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: '2px',
              }}
            >
              {userEmail}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--axf-cyan, #19D7FE)',
                  backgroundColor: 'rgba(25, 215, 254, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid rgba(25, 215, 254, 0.25)',
                }}
              >
                {organizationName}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(11, 135, 254, 0.15)',
                  color: 'var(--axf-cyan, #19D7FE)',
                  border: '1px solid rgba(11, 135, 254, 0.3)',
                }}
              >
                {role}
              </span>
            </div>
          </div>

          {/* Profile Option */}
          <Link
            href="/settings#profile"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary, #F5F7FA)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated, #131E2F)';
              e.currentTarget.style.color = 'var(--axf-cyan, #19D7FE)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary, #F5F7FA)';
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </Link>

          {/* Settings Option */}
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary, #F5F7FA)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated, #131E2F)';
              e.currentTarget.style.color = 'var(--axf-cyan, #19D7FE)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary, #F5F7FA)';
            }}
          >
            <svg
              width="15"
              height="15"
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
            <span>Settings</span>
          </Link>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--border, #1C2A3A)',
              margin: '4px 0',
            }}
          />

          {/* Sign Out Option */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            role="menuitem"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isSigningOut ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
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
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
