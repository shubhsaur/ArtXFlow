'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Avatar,
  toast,
} from '@artxflow/ui';
import {
  DEFAULT_HASHNODE_PUBLISH_MODE,
  resolveHashnodePublishMode,
  type HashnodePublishMode,
  DEFAULT_MEDIUM_PUBLISH_MODE,
  resolveMediumPublishMode,
  type MediumPublishMode,
} from '@artxflow/types';
import { HashnodePublishModePicker } from './hashnode-publish-mode-picker';
import { MediumPublishModePicker } from './medium-publish-mode-picker';

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
  tokenMetadata?: Record<string, unknown>;
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
    description:
      'Connect Medium, then choose a default publish method. New tokens were discontinued in 2025; free options use the Chrome extension, medium.com/new-story, or a live URL you record.',
    secretLabel: 'Medium Integration Token',
    secretPlaceholder: 'e.g. 2e4b8f... (optional for free modes)',
    helpText:
      'Medium discontinued new tokens in 2025. You can connect free without a token using the Chrome extension or web editor, or enter an existing token for the API.',
    helpLink: 'https://help.medium.com',
  },
  {
    id: 'hashnode',
    name: 'Hashnode',
    badgeColor: '#2962FF',
    description:
      'Connect Hashnode, then choose a default publish method. The GraphQL API needs Pro; free options use the Chrome extension, hn.new, or a live URL you record.',
    secretLabel: 'Hashnode Personal Access Token',
    secretPlaceholder: 'e.g. 8a7c6e...',
    helpText:
      'Generate a PAT in Hashnode Account Settings → Developer. The token verifies your account. Publishing via API additionally requires Hashnode Pro.',
    helpLink: 'https://hashnode.com/settings/developer',
  },
];

export function ConnectedPlatforms() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [_loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hashnodePublishMode, setHashnodePublishMode] = useState<HashnodePublishMode>(
    DEFAULT_HASHNODE_PUBLISH_MODE,
  );
  const [savingHashnodeMode, setSavingHashnodeMode] = useState(false);
  const [mediumPublishMode, setMediumPublishMode] = useState<MediumPublishMode>(
    DEFAULT_MEDIUM_PUBLISH_MODE,
  );
  const [savingMediumMode, setSavingMediumMode] = useState(false);

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
      const nextConnections: PlatformConnection[] = data.connections || [];
      setConnections(nextConnections);

      const hashnodeConn = nextConnections.find(
        (c) => c.provider.toLowerCase() === 'hashnode' && c.status === 'CONNECTED',
      );
      if (hashnodeConn) {
        setHashnodePublishMode(resolveHashnodePublishMode(hashnodeConn.tokenMetadata));
      } else {
        setHashnodePublishMode(DEFAULT_HASHNODE_PUBLISH_MODE);
      }

      const mediumConn = nextConnections.find(
        (c) => c.provider.toLowerCase() === 'medium' && c.status === 'CONNECTED',
      );
      if (mediumConn) {
        setMediumPublishMode(resolveMediumPublishMode(mediumConn.tokenMetadata));
      } else {
        setMediumPublishMode(DEFAULT_MEDIUM_PUBLISH_MODE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching connections');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(provider: string) {
    const rawSecret = secrets[provider]?.trim();

    if (provider === 'medium') {
      if (mediumPublishMode === 'api' && !rawSecret) {
        const msg = 'Please enter an existing Medium Integration Token to connect in API mode';
        setError(msg);
        toast.error(msg);
        return;
      }
    } else if (!rawSecret) {
      const msg = `Please enter your ${provider.toUpperCase()} credentials/token`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setSuccess(null);
    setConnectingProvider(provider);

    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          secret: rawSecret || undefined,
          ...(provider === 'hashnode' ? { hashnodePublishMode } : {}),
          ...(provider === 'medium' ? { mediumPublishMode } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to connect ${provider}`);
      }

      setSecrets((prev) => ({ ...prev, [provider]: '' }));
      const successMsg =
        provider === 'hashnode'
          ? 'Hashnode connected. Default publish method saved — you can change it anytime below.'
          : provider === 'medium'
            ? 'Medium connected. Default publish method saved — you can change it anytime below.'
            : `Successfully connected to ${provider.toUpperCase()}!`;
      setSuccess(successMsg);
      toast.success(successMsg);
      await fetchConnections();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to connect to ${provider}`;
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setConnectingProvider(null);
    }
  }

  async function handleHashnodeModeChange(mode: HashnodePublishMode, connectionId?: string) {
    setHashnodePublishMode(mode);
    if (!connectionId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSavingHashnodeMode(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: connectionId, hashnodePublishMode: mode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save Hashnode publish method');
      }
      const successMsg = 'Hashnode publish method updated. New publishes will use this default.';
      setSuccess(successMsg);
      toast.success(successMsg);
      await fetchConnections();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save Hashnode publish method';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSavingHashnodeMode(false);
    }
  }

  async function handleMediumModeChange(mode: MediumPublishMode, connectionId?: string) {
    setMediumPublishMode(mode);
    if (!connectionId) {
      return;
    }

    setError(null);
    setSuccess(null);
    setSavingMediumMode(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: connectionId, mediumPublishMode: mode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save Medium publish method');
      }
      const successMsg = 'Medium publish method updated. New publishes will use this default.';
      setSuccess(successMsg);
      toast.success(successMsg);
      await fetchConnections();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save Medium publish method';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSavingMediumMode(false);
    }
  }

  async function handleDisconnect(connectionId: string, providerName: string) {
    if (
      !confirm(
        `Are you sure you want to disconnect ${providerName}? Publications already published will remain on the platform.`,
      )
    ) {
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

      const successMsg = `Disconnected from ${providerName}`;
      setSuccess(successMsg);
      toast.success(successMsg);
      await fetchConnections();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to disconnect ${providerName}`;
      setError(errorMsg);
      toast.error(errorMsg);
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
          Connect your accounts on external developer platforms. Credentials are encrypted using
          AES-256-GCM and verified with the platform API.
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
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isConnected && platform.id === 'medium' && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            mediumPublishMode === 'extension'
                              ? 'rgba(25, 215, 254, 0.15)'
                              : mediumPublishMode === 'medium_new'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : mediumPublishMode === 'manual'
                                  ? 'rgba(168, 85, 247, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                          color:
                            mediumPublishMode === 'extension'
                              ? 'var(--axf-cyan, #19D7FE)'
                              : mediumPublishMode === 'medium_new'
                                ? '#60A5FA'
                                : mediumPublishMode === 'manual'
                                  ? '#C084FC'
                                  : '#F59E0B',
                          border: '1px solid currentColor',
                        }}
                      >
                        {mediumPublishMode === 'extension'
                          ? '⚡ Extension'
                          : mediumPublishMode === 'medium_new'
                            ? '📋 new-story'
                            : mediumPublishMode === 'manual'
                              ? '🔗 Record URL'
                              : '🔑 API'}
                      </span>
                    )}
                    {isConnected && platform.id === 'hashnode' && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            hashnodePublishMode === 'extension'
                              ? 'rgba(25, 215, 254, 0.15)'
                              : hashnodePublishMode === 'hn_new'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : hashnodePublishMode === 'manual'
                                  ? 'rgba(168, 85, 247, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                          color:
                            hashnodePublishMode === 'extension'
                              ? 'var(--axf-cyan, #19D7FE)'
                              : hashnodePublishMode === 'hn_new'
                                ? '#60A5FA'
                                : hashnodePublishMode === 'manual'
                                  ? '#C084FC'
                                  : '#F59E0B',
                          border: '1px solid currentColor',
                        }}
                      >
                        {hashnodePublishMode === 'extension'
                          ? '⚡ Extension'
                          : hashnodePublishMode === 'hn_new'
                            ? '📋 hn.new'
                            : hashnodePublishMode === 'manual'
                              ? '🔗 Record URL'
                              : '🔑 API'}
                      </span>
                    )}
                    <Badge variant={isConnected ? 'success' : 'default'}>
                      {isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {isConnected && conn ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '14px',
                              color: 'var(--text-primary, #F5F7FA)',
                            }}
                          >
                            {account?.displayName || account?.username || 'Verified Account'}
                          </div>
                          {account?.username && (
                            <div
                              style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}
                            >
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

                    {platform.id === 'hashnode' && (
                      <HashnodePublishModePicker
                        value={hashnodePublishMode}
                        saving={savingHashnodeMode}
                        disabled={savingHashnodeMode || Boolean(isDisconnecting)}
                        onChange={(mode) => handleHashnodeModeChange(mode, conn.id)}
                      />
                    )}

                    {platform.id === 'medium' && (
                      <MediumPublishModePicker
                        value={mediumPublishMode}
                        saving={savingMediumMode}
                        disabled={savingMediumMode || Boolean(isDisconnecting)}
                        onChange={(mode) => handleMediumModeChange(mode, conn.id)}
                      />
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {platform.id === 'hashnode' && (
                      <HashnodePublishModePicker
                        value={hashnodePublishMode}
                        disabled={isConnecting}
                        onChange={setHashnodePublishMode}
                      />
                    )}

                    {platform.id === 'medium' && (
                      <MediumPublishModePicker
                        value={mediumPublishMode}
                        disabled={isConnecting}
                        onChange={setMediumPublishMode}
                      />
                    )}

                    {platform.id === 'medium' && mediumPublishMode !== 'api' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md, 8px)',
                          backgroundColor: 'rgba(0, 171, 108, 0.08)',
                          border: '1px solid rgba(0, 171, 108, 0.25)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary, #AAB5C4)',
                            flex: 1,
                            minWidth: '220px',
                          }}
                        >
                          No API token required. Click connect to enable free browser-session
                          publishing via the Chrome extension or web editor.
                        </div>
                        <Button
                          size="md"
                          disabled={isConnecting}
                          loading={isConnecting}
                          onClick={() => handleConnect(platform.id)}
                        >
                          ⚡ Connect Medium (Free)
                        </Button>
                      </div>
                    ) : (
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
                          loading={isConnecting}
                          onClick={() => handleConnect(platform.id)}
                        >
                          {isConnecting ? 'Verifying...' : `Connect ${platform.name}`}
                        </Button>
                      </div>
                    )}

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
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
              All articles published to ArtXFlow automatically generate SEO metadata, canonical
              URLs, and RSS feeds under your workspace domain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
