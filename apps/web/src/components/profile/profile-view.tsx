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
import { PlatformConnectionsView } from './platform-connections-view';

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
  initialTab?: SettingsTab;
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
  initialTab,
  initialConnections,
  initialApiKeys,
}: ProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab || 'profile');
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
          {/* Mobile Horizontal Category Pills (< 860px) */}
          <div className="profile-mobile-nav-pills">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: activeTab === 'profile' ? 600 : 500,
                backgroundColor:
                  activeTab === 'profile'
                    ? 'var(--surface-raised, #0D1420)'
                    : 'transparent',
                color:
                  activeTab === 'profile'
                    ? 'var(--flow-cyan, #19D7FE)'
                    : 'var(--text-muted, #66768D)',
                border:
                  activeTab === 'profile'
                    ? '1px solid rgba(25, 215, 254, 0.3)'
                    : '1px solid transparent',
                boxShadow:
                  activeTab === 'profile'
                    ? '0 0 12px rgba(25, 215, 254, 0.15)'
                    : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'profile' && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--flow-cyan, #19D7FE)',
                  }}
                />
              )}
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('workspace')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: activeTab === 'workspace' ? 600 : 500,
                backgroundColor:
                  activeTab === 'workspace'
                    ? 'var(--surface-raised, #0D1420)'
                    : 'transparent',
                color:
                  activeTab === 'workspace'
                    ? 'var(--flow-cyan, #19D7FE)'
                    : 'var(--text-muted, #66768D)',
                border:
                  activeTab === 'workspace'
                    ? '1px solid rgba(25, 215, 254, 0.3)'
                    : '1px solid transparent',
                boxShadow:
                  activeTab === 'workspace'
                    ? '0 0 12px rgba(25, 215, 254, 0.15)'
                    : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'workspace' && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--flow-cyan, #19D7FE)',
                  }}
                />
              )}
              Workspace
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('platforms')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: activeTab === 'platforms' ? 600 : 500,
                backgroundColor:
                  activeTab === 'platforms'
                    ? 'var(--surface-raised, #0D1420)'
                    : 'transparent',
                color:
                  activeTab === 'platforms'
                    ? 'var(--flow-cyan, #19D7FE)'
                    : 'var(--text-muted, #66768D)',
                border:
                  activeTab === 'platforms'
                    ? '1px solid rgba(25, 215, 254, 0.3)'
                    : '1px solid transparent',
                boxShadow:
                  activeTab === 'platforms'
                    ? '0 0 12px rgba(25, 215, 254, 0.15)'
                    : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'platforms' && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--flow-cyan, #19D7FE)',
                  }}
                />
              )}
              Connections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('api-keys')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: activeTab === 'api-keys' ? 600 : 500,
                backgroundColor:
                  activeTab === 'api-keys'
                    ? 'var(--surface-raised, #0D1420)'
                    : 'transparent',
                color:
                  activeTab === 'api-keys'
                    ? 'var(--flow-cyan, #19D7FE)'
                    : 'var(--text-muted, #66768D)',
                border:
                  activeTab === 'api-keys'
                    ? '1px solid rgba(25, 215, 254, 0.3)'
                    : '1px solid transparent',
                boxShadow:
                  activeTab === 'api-keys'
                    ? '0 0 12px rgba(25, 215, 254, 0.15)'
                    : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {activeTab === 'api-keys' && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--flow-cyan, #19D7FE)',
                  }}
                />
              )}
              API Keys
            </button>
          </div>

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
            <PlatformConnectionsView
              initialConnections={initialConnections}
              workspaceName={workspace.name}
            />
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
