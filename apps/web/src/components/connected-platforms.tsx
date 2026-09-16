'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Avatar } from '@artxflow/ui';

interface PlatformAccount {
  externalId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}

interface PlatformConnection {
  id: string;
  organizationId: string;
  provider: 'devto' | 'medium' | 'hashnode' | string;
  status: 'CONNECTED' | 'REVOKED' | 'EXPIRED' | string;
  createdAt: string;
  updatedAt: string;
  accounts?: PlatformAccount[];
}

interface PlatformConfig {
  id: 'devto' | 'medium' | 'hashnode';
  name: string;
  badgeColor: string;
  description: string;
  secretLabel: string;
  secretPlaceholder: string;
  helpText: string;
  helpLink: string;
}

const SUPPORTED_PLATFORMS: PlatformConfig[] = [
  {
    id: 'devto',
    name: 'DEV.to',
    badgeColor: '#0B87FE',
    description: 'Publish articles directly to the global DEV Community.',
    secretLabel: 'DEV.to API Key',
    secretPlaceholder: 'e.g. 19a4b2c8...',
    helpText: 'Generate an API key in DEV.to Settings → Extensions → DEV Community API Keys',
    helpLink: 'https://dev.to/settings/extensions',
  },
  {
    id: 'medium',
    name: 'Medium',
    badgeColor: '#00AB6C',
    description: 'Distribute stories to your Medium profile with automatic canonical link attribution.',
    secretLabel: 'Medium Integration Token',
    secretPlaceholder: 'e.g. 2e4b8f...',
    helpText: 'Generate an Integration Token in Medium Settings → Security and apps',
    helpLink: 'https://medium.com/me/settings/security',
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    badgeColor: '#2962FF',
    description: 'Sync articles to your personal Hashnode engineering blog via GraphQL.',
    secretLabel: 'Hashnode Personal Access Token',
    secretPlaceholder: 'e.g. 8a7c6e...',
    helpText: 'Generate a PAT in Hashnode Account Settings → Developer',
    helpLink: 'https://hashnode.com/settings/developer',
  },
];

export function ConnectedPlatforms() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  async function fetchConnections() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/connections');
      if (!res.ok) {
        throw new Error('Failed to load platform connections');
      }
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching connections');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: string) {
    const secret = secrets[provider]?.trim();
    if (!secret) {
      setError(`Please enter your ${provider.toUpperCase()} credentials/token`);
      return;
    }

    setError(null);
    setSuccess(null);
    setConnectingProvider(provider);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, secret }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to connect ${provider}`);
      }

      setSecrets((prev) => ({ ...prev, [provider]: '' }));
      setSuccess(`Successfully connected to ${provider.toUpperCase()}!`);
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to connect to ${provider}`);
    } finally {
      setConnectingProvider(null);
    }
  }

  async function handleDisconnect(connectionId: string, providerName: string) {
    if (!confirm(`Are you sure you want to disconnect ${providerName}? Publications already published will remain on the platform.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    setDisconnectingId(connectionId);

    try {
      const res = await fetch(`/api/connections?id=${connectionId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to disconnect ${providerName}`);
      }

      setSuccess(`Disconnected from ${providerName}`);
      await fetchConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to disconnect ${providerName}`);
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary, #F5F7FA)',
            letterSpacing: '-0.01em',
          }}
        >
          Connected Publishing Platforms
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary, #AAB5C4)',
            marginTop: '4px',
          }}
        >
          Connect your accounts on external developer platforms. Credentials are encrypted using AES-256-GCM and verified with the platform API.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontSize: '14px',
          }}
        >
          {success}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {SUPPORTED_PLATFORMS.map((platform) => {
          const conn = connections.find(
            (c) => c.provider.toLowerCase() === platform.id && c.status === 'CONNECTED',
          );
          const isConnected = Boolean(conn);
          const account = conn?.accounts?.[0];
          const isConnecting = connectingProvider === platform.id;
          const isDisconnecting = conn && disconnectingId === conn.id;

          return (
            <Card key={platform.id} style={{ overflow: 'hidden' }}>
              <CardHeader style={{ paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-elevated, #131E2F)',
                        border: '1px solid var(--border, #1C2A3A)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: platform.badgeColor,
                      }}
                    >
                      {platform.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle style={{ fontSize: '16px' }}>{platform.name}</CardTitle>
                      <CardDescription>{platform.description}</CardDescription>
                    </div>
                  </div>

                  <Badge variant={isConnected ? 'success' : 'default'}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {isConnected && conn ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md, 8px)',
                      backgroundColor: 'var(--surface-elevated, #131E2F)',
                      border: '1px solid var(--border-subtle, #142232)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar
                        src={account?.avatarUrl}
                        name={account?.displayName || account?.username || platform.name}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary, #F5F7FA)' }}>
                          {account?.displayName || account?.username || 'Verified Account'}
                        </div>
                        {account?.username && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                            @{account.username}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isDisconnecting}
                      onClick={() => handleDisconnect(conn.id, platform.name)}
                    >
                      {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="password"
                        placeholder={platform.secretPlaceholder}
                        aria-label={platform.secretLabel}
                        value={secrets[platform.id] || ''}
                        onChange={(e) =>
                          setSecrets((prev) => ({ ...prev, [platform.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleConnect(platform.id);
                          }
                        }}
                        style={{
                          flex: 1,
                          minWidth: '240px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md, 8px)',
                          backgroundColor: 'var(--surface-elevated, #131E2F)',
                          border: '1px solid var(--border, #1C2A3A)',
                          color: 'var(--text-primary, #F5F7FA)',
                          fontSize: '14px',
                          fontFamily: "var(--font-mono, 'Geist Mono', monospace)",
                          outline: 'none',
                        }}
                      />
                      <Button
                        size="md"
                        disabled={isConnecting}
                        onClick={() => handleConnect(platform.id)}
                      >
                        {isConnecting ? 'Verifying...' : `Connect ${platform.name}`}
                      </Button>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                      <span>{platform.helpText} — </span>
                      <a
                        href={platform.helpLink}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ color: 'var(--axf-cyan, #19D7FE)', textDecoration: 'none' }}
                      >
                        Open settings ↗
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* ArtXFlow Hosted Site Card */}
        <Card style={{ overflow: 'hidden' }}>
          <CardHeader style={{ paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-elevated, #131E2F)',
                    border: '1px solid var(--border, #1C2A3A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--axf-cyan, #19D7FE)',
                  }}
                >
                  AXF
                </div>
                <div>
                  <CardTitle style={{ fontSize: '16px' }}>ArtXFlow Hosted Site</CardTitle>
                  <CardDescription>
                    Your canonical blog published under your dedicated organization subdomain.
                  </CardDescription>
                </div>
              </div>

              <Badge variant="success">Active (Built-in)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
              All articles published to ArtXFlow automatically generate SEO metadata, canonical URLs, and RSS feeds under your workspace domain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
