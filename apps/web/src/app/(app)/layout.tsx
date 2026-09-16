import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { Logo, Avatar, Badge } from '@artxflow/ui';
import { SignOutButton } from '../../components/sign-out-button';

export const dynamic = 'force-dynamic';

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    redirect('/login');
  }

  // Ensure personal organization & OWNER membership exist
  const { organization, membership } = await bootstrapPersonalOrganization({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <header
        role="banner"
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border, #1C2A3A)',
          backgroundColor: 'var(--surface, #0D1420)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Brand & Organization Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/dashboard" aria-label="ArtXFlow Home">
            <Logo size={28} showWordmark={true} />
          </Link>

          <div
            style={{
              height: '24px',
              width: '1px',
              backgroundColor: 'var(--border, #1C2A3A)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {organization.name}
            </span>
            <Badge variant="info">{membership.role}</Badge>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          aria-label="Main Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-primary, #F5F7FA)',
              transition: 'background-color 0.15s ease',
            }}
          >
            Dashboard
          </Link>

          <Link
            href="/articles"
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-secondary, #AAB5C4)',
              transition: 'background-color 0.15s ease',
            }}
          >
            Articles
          </Link>

          <Link
            href="/settings"
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm, 6px)',
              color: 'var(--text-secondary, #AAB5C4)',
              transition: 'background-color 0.15s ease',
            }}
          >
            Settings
          </Link>
        </nav>

        {/* User Profile & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar
              src={session.user.image}
              name={session.user.name || session.user.email}
              size="sm"
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {session.user.name || session.user.email}
            </span>
          </div>

          <SignOutButton />
        </div>
      </header>

      {/* Main App Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
