import React from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { AppShell } from '../../components/app-shell';

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
    <AppShell
      user={session.user}
      organization={organization}
      membership={membership}
      emailVerified={Boolean(session.user.emailVerified)}
    >
      {children}
    </AppShell>
  );
}
