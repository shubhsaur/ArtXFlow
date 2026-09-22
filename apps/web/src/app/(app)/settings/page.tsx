import React from 'react';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  profileRepository,
  platformConnectionRepository,
  apiKeyRepository,
} from '@artxflow/database';
import { ProfileView } from '../../../components/profile/profile-view';
import type { ProfileFormData, SecurityTelemetry } from '../../../components/profile/profile-types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization, membership } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  const [fullProfile, securityData, connectionsWithAccounts, apiKeysList] = await Promise.all([
    profileRepository.getFullUserProfile(user.id),
    profileRepository.getSecurityTelemetry(user.id),
    platformConnectionRepository.listWithAccountsByOrganization(organization.id),
    apiKeyRepository.listByUser(user.id),
  ]);

  const initialProfile: ProfileFormData = {
    name: fullProfile?.name || user.name || '',
    email: user.email,
    emailVerified: user.emailVerified,
    image: fullProfile?.image || user.image || null,
    canonicalUrl: fullProfile?.canonicalUrl || '',
    bio: fullProfile?.bio || '',
  };

  const telemetry: SecurityTelemetry = {
    ssoProvider: securityData.ssoProvider,
    ssoAccountId: securityData.ssoAccountId,
    ssoActive: Boolean(securityData.ssoProvider),
    hasPassword: securityData.hasPassword,
  };

  const serializedConnections = connectionsWithAccounts.map((conn) => ({
    ...conn,
    createdAt: conn.createdAt.toISOString(),
    updatedAt: conn.updatedAt.toISOString(),
    accounts: conn.accounts.map((acc) => ({
      ...acc,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
    })),
  }));

  const serializedApiKeys = apiKeysList.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    scopes: k.scopes,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    revokedAt: k.revokedAt?.toISOString() ?? null,
  }));

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--surface-base, #070B12)',
        border: '1px solid var(--border-subtle, #172333)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      }}
    >
      <ProfileView
        initialProfile={initialProfile}
        telemetry={telemetry}
        workspace={{
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          role: membership.role,
        }}
        connectedPlatformCount={connectionsWithAccounts.length}
        initialConnections={serializedConnections}
        initialApiKeys={serializedApiKeys}
      />
    </div>
  );
}
