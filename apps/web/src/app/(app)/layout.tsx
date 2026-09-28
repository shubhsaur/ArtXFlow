import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { AppHeader } from '../../components/app-header';
import { EmailVerificationBanner } from '../../components/email-verification-banner';

export const dynamic = 'force-dynamic';

export default async function AppShellLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    redirect('/login');
  }

  // Ensure personal organization & OWNER membership exist
  const { organization, membership, created } = await bootstrapPersonalOrganization({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  // Automatically route first-time users (including OAuth sign-ins) into the onboarding wizard
  if (created) {
    redirect('/onboarding');
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader user={session.user} organization={organization} membership={membership} />

      {!session.user.emailVerified && <EmailVerificationBanner email={session.user.email} />}

      {/* Main App Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="app-main-content"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {children}
      </main>
    </div>
  );
}
