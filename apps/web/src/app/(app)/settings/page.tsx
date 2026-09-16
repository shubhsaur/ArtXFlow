import React from 'react';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@artxflow/ui';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization, membership } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary, #F5F7FA)',
            letterSpacing: '-0.02em',
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary, #AAB5C4)',
            marginTop: '4px',
          }}
        >
          Manage your organization workspace and user profile preferences.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Organization Workspace Card */}
        <Card>
          <CardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <CardTitle>Workspace Organization</CardTitle>
                <CardDescription>
                  Tenant boundary for your content, sites, and connected platform destinations.
                </CardDescription>
              </div>
              <Badge variant="info">{membership.role}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                fontSize: '14px',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Workspace Name
                </span>
                <span style={{ fontWeight: 600 }}>{organization.name}</span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Workspace Slug
                </span>
                <code
                  style={{
                    backgroundColor: 'var(--surface-elevated, #131E2F)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: 'var(--axf-cyan, #19D7FE)',
                  }}
                >
                  {organization.slug}
                </code>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Organization ID
                </span>
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: 'var(--text-secondary, #AAB5C4)',
                  }}
                >
                  {organization.id}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Your personal authentication and credential details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                fontSize: '14px',
              }}
            >
              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Display Name
                </span>
                <span style={{ fontWeight: 600 }}>{user.name || 'Not provided'}</span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Email Address
                </span>
                <span>{user.email}</span>
              </div>

              <div>
                <span
                  style={{
                    color: 'var(--text-secondary, #AAB5C4)',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  Email Status
                </span>
                <Badge variant={user.emailVerified ? 'success' : 'warning'}>
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
