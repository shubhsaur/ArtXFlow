'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';
import { EmailVerificationBanner } from './email-verification-banner';

export interface AppShellProps {
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
  emailVerified: boolean;
  children: React.ReactNode;
}

export function AppShell({
  user,
  organization,
  membership,
  emailVerified,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const isEditor =
    pathname?.startsWith('/articles/new') ||
    (Boolean(pathname?.startsWith('/articles/')) && pathname !== '/articles');

  if (isEditor) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--surface-base, #070B12)',
          color: 'var(--text-primary, #F5F7FA)',
        }}
      >
        {!emailVerified && <EmailVerificationBanner email={user.email} />}
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        user={user}
        organization={organization}
        membership={membership}
      />

      {!emailVerified && <EmailVerificationBanner email={user.email} />}

      {/* Main App Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="app-main-content"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: pathname === '/articles' ? '1600px' : '1200px',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
