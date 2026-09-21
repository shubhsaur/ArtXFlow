'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export type SettingsTab = 'profile' | 'platforms' | 'workspace';

interface ProfileNavRailProps {
  activeTab: SettingsTab;
  onTabSelect: (tab: SettingsTab) => void;
  workspaceName: string;
  platformCount?: number;
}

export function ProfileNavRail({
  activeTab,
  onTabSelect,
  workspaceName,
  platformCount = 0,
}: ProfileNavRailProps) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch('/api/auth/sign-out', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      window.location.href = '/login';
    }
  }

  const navItems: Array<{
    id: SettingsTab;
    label: string;
    icon: string;
    badge?: string;
    badgeVariant?: 'blue' | 'amber';
  }> = [
    { id: 'profile', label: 'Profile & Account', icon: 'account_circle' },
    {
      id: 'platforms',
      label: 'Platform Connections',
      icon: 'hub',
      badge: platformCount > 0 ? `${platformCount} Connected` : undefined,
      badgeVariant: 'blue',
    },
    { id: 'workspace', label: 'Workspace Details', icon: 'corporate_fare' },
  ];

  return (
    <aside className="profile-nav-aside">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Workspace Identity Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-container-lowest, #0A0E15)',
            border: '1px solid var(--border-subtle, #172333)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--flow-blue, #0B87FE), #1C2027)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              corporate_fare
            </span>
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <h2
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                margin: 0,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {workspaceName || 'ArtXFlow Core'}
            </h2>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted, #66768D)',
                margin: '2px 0 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Workspace Settings
            </p>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-muted, #66768D)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Workspace & Identity
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabSelect(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  borderRadius: '0 6px 6px 0',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderLeft: isActive
                    ? '2px solid var(--flow-cyan, #19D7FE)'
                    : '2px solid transparent',
                  backgroundColor: isActive
                    ? 'var(--surface-container-low, #171C23)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--flow-cyan, #19D7FE)'
                    : 'var(--text-secondary, #AAB5C4)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                  width: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: '18px',
                    flexShrink: 0,
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      flexShrink: 0,
                      border:
                        item.badgeVariant === 'amber'
                          ? '1px solid rgba(245,158,11,0.3)'
                          : '1px solid var(--border-subtle, #172333)',
                      backgroundColor:
                        item.badgeVariant === 'amber'
                          ? 'rgba(245,158,11,0.15)'
                          : 'var(--surface-container, #1C2027)',
                      color:
                        item.badgeVariant === 'amber'
                          ? '#FBBF24'
                          : 'var(--flow-blue, #0B87FE)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Rail Tabs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          borderTop: '1px solid var(--border-subtle, #172333)',
          paddingTop: '12px',
        }}
      >
        <a
          href="https://artxflow.dev/docs"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            fontSize: '13px',
            color: 'var(--text-secondary, #AAB5C4)',
            textDecoration: 'none',
            borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
            menu_book
          </span>
          <span>Docs & Specs</span>
        </a>


        <button
          type="button"
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-muted, #66768D)',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left',
            marginTop: '4px',
            transition: 'all 0.15s ease',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
            logout
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
