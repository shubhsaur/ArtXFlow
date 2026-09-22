'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileFormData, SecurityTelemetry } from './profile-types';
import { ProfileNavRail, type SettingsTab } from './profile-nav-rail';
import { ProfileHeader } from './profile-header';
import { ProfileAuthorCard } from './profile-author-card';
import { ProfileApiKeysCard } from './profile-api-keys-card';
import { ProfileSecurityCard } from './profile-security-card';
import { ProfileDeleteAccount } from './profile-delete-account';
import { ProfileStickyBar } from './profile-sticky-bar';
import { ConnectedPlatforms } from '../connected-platforms';

interface ProfileViewProps {
  initialProfile: ProfileFormData;
  telemetry: SecurityTelemetry;
  workspace: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
  connectedPlatformCount: number;
  initialConnections?: Array<{
    id: string;
    organizationId: string;
    provider: string;
    status: string;
    encryptedSecret: string;
    tokenMetadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
    accounts: Array<{
      id: string;
      connectionId: string;
      externalId: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
      metadata: Record<string, unknown>;
      createdAt: string;
      updatedAt: string;
    }>;
  }>;
  initialApiKeys?: Array<{
    id: string;
    name: string;
    keyPrefix: string;
    scopes: string[];
    createdAt: string;
    lastUsedAt: string | null;
    revokedAt: string | null;
  }>;
}

export function ProfileView({
  initialProfile,
  telemetry,
  workspace,
  connectedPlatformCount,
  initialConnections,
  initialApiKeys,
}: ProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [initialData, setInitialData] = useState<ProfileFormData>(initialProfile);
  const [formData, setFormData] = useState<ProfileFormData>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFieldChange = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const isValid = useMemo(() => {
    if (formData.bio && formData.bio.length > 240) return false;
    if (formData.canonicalUrl && formData.canonicalUrl.trim().length > 0) {
      try {
        new URL(formData.canonicalUrl);
      } catch {
        return false;
      }
    }
    return true;
  }, [formData]);

  const handleReset = () => {
    setFormData(initialData);
    showToast('Changes discarded.');
  };

  const handleSave = async () => {
    if (!isValid || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save changes');
      }

      setInitialData(formData);
      showToast('Profile and syndication settings saved successfully.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error saving settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload avatar');
      }

      const data = await res.json();
      handleFieldChange('image', data.imageUrl);
      setInitialData((prev) => ({ ...prev, image: data.imageUrl }));
      router.refresh();
      showToast('Avatar updated successfully.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to upload picture', 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to remove avatar');
      }
      handleFieldChange('image', null);
      setInitialData((prev) => ({ ...prev, image: null }));
      router.refresh();
      showToast('Avatar removed.');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to remove avatar', 'error');
    }
  };

  return (
    <div className="profile-shell" style={{ position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 50,
            padding: '12px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: `1px solid ${
              toastMessage.type === 'success'
                ? 'var(--status-success, #12B76A)'
                : 'var(--status-error, #D92D20)'
            }`,
            color:
              toastMessage.type === 'success'
                ? 'var(--status-success, #12B76A)'
                : 'var(--status-error, #D92D20)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {toastMessage.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Left SideNav Rail */}
      <ProfileNavRail
        activeTab={activeTab}
        onTabSelect={(tab) => setActiveTab(tab)}
        workspaceName={workspace.name}
        platformCount={connectedPlatformCount}
      />

      {/* Main Workspace Content Canvas */}
      <main className="profile-main-canvas">
        <div className="profile-content-container">
          {activeTab === 'profile' && (
            <>
              {/* Header */}
              <ProfileHeader
                isDirty={isDirty}
                isSaving={isSaving}
                onDiscard={handleReset}
                onSave={handleSave}
              />

              {/* Section 1: Canonical Author Profile */}
              <ProfileAuthorCard
                formData={formData}
                onChange={handleFieldChange}
                onAvatarUpload={handleAvatarUpload}
                onAvatarRemove={handleAvatarRemove}
                isUploadingAvatar={isUploadingAvatar}
              />

              {/* Section 2: Security & Authentication */}
              <ProfileSecurityCard telemetry={telemetry} />

              {/* Section 3: Delete Account */}
              <ProfileDeleteAccount />

              {/* Sticky Bottom Save Bar */}
              <ProfileStickyBar
                isDirty={isDirty}
                isSaving={isSaving}
                isValid={isValid}
                onReset={handleReset}
                onSave={handleSave}
              />
            </>
          )}

          {activeTab === 'platforms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #F5F7FA)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  Platform Connections
                </h1>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginTop: '4px',
                    marginBottom: 0,
                  }}
                >
                  Connect and configure publishing adapters for cross-platform syndication.
                </p>
              </div>
              <ConnectedPlatforms initialConnections={initialConnections} />
            </div>
          )}

          {activeTab === 'api-keys' && <ProfileApiKeysCard initialKeys={initialApiKeys} />}

          {activeTab === 'workspace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h1
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #F5F7FA)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                  }}
                >
                  Workspace Details
                </h1>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginTop: '4px',
                    marginBottom: 0,
                  }}
                >
                  Tenant boundary for your content, sites, and connected platform destinations.
                </p>
              </div>
              <div
                className="profile-card"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Workspace Name
                  </span>
                  <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                    {workspace.name}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Workspace Slug
                  </span>
                  <code
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '12px',
                      color: 'var(--flow-cyan, #19D7FE)',
                      backgroundColor: 'var(--surface-container, #1C2027)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle, #172333)',
                    }}
                  >
                    {workspace.slug}
                  </code>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    Role
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--flow-blue, #0B87FE)',
                      fontSize: '14px',
                    }}
                  >
                    {workspace.role}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
