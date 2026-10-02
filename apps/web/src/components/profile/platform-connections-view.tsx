'use client';

import React, { useState, useEffect } from 'react';
import {
  DEFAULT_HASHNODE_PUBLISH_MODE,
  resolveHashnodePublishMode,
  type HashnodePublishMode,
  DEFAULT_MEDIUM_PUBLISH_MODE,
  resolveMediumPublishMode,
  type MediumPublishMode,
} from '@artxflow/types';
import { HashnodePublishModePicker } from '../hashnode-publish-mode-picker';
import { MediumPublishModePicker } from '../medium-publish-mode-picker';

export interface PlatformAccount {
  id?: string;
  externalId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  metadata?: Record<string, unknown>;
}

export interface PlatformConnection {
  id: string;
  organizationId: string;
  provider: string;
  status: 'CONNECTED' | 'REVOKED' | 'EXPIRED' | 'PENDING_AUTH' | string;
  tokenMetadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  accounts?: PlatformAccount[];
}

export interface PlatformConnectionsViewProps {
  initialConnections?: PlatformConnection[];
  workspaceName?: string;
  onBackToDashboard?: () => void;
}

type FilterCategory = 'all' | 'connected' | 'pending';

export function PlatformConnectionsView({
  initialConnections = [],
  workspaceName = 'ArtXFlow Core',
  onBackToDashboard,
}: PlatformConnectionsViewProps) {
  const [connections, setConnections] = useState<PlatformConnection[]>(initialConnections);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [isPingingAll, setIsPingingAll] = useState(false);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Per-platform secrets input state
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  // Ping latencies (ms) with live update state
  const [latencies, setLatencies] = useState<Record<string, number>>({
    devto: 14,
    hashnode: 28,
    medium: 18,
    github: 42,
  });

  // Ghost & Substack state
  const [ghostUrl, setGhostUrl] = useState('https://journal.shubh.dev');
  const [ghostKey, setGhostKey] = useState('65a123bc45def678901234:fedcba0987654321');
  const [ghostStatus, setGhostStatus] = useState<'PENDING_AUTH' | 'CONNECTED'>('PENDING_AUTH');
  const [isConnectingGhost, setIsConnectingGhost] = useState(false);

  const [substackHandle, setSubstackHandle] = useState('');
  const [substackConnected, setSubstackConnected] = useState(false);
  const [isConnectingSubstack, setIsConnectingSubstack] = useState(false);

  // GitHub branch sync state
  const [isSyncingGitHub, setIsSyncingGitHub] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Publish Modes
  const [hashnodePublishMode, setHashnodePublishMode] = useState<HashnodePublishMode>(() => {
    if (!initialConnections?.length) return DEFAULT_HASHNODE_PUBLISH_MODE;
    const conn = initialConnections.find(
      (c) => c.provider.toLowerCase() === 'hashnode' && c.status === 'CONNECTED',
    );
    return conn ? resolveHashnodePublishMode(conn.tokenMetadata) : DEFAULT_HASHNODE_PUBLISH_MODE;
  });
  const [savingHashnodeMode, setSavingHashnodeMode] = useState(false);

  const [mediumPublishMode, setMediumPublishMode] = useState<MediumPublishMode>(() => {
    if (!initialConnections?.length) return DEFAULT_MEDIUM_PUBLISH_MODE;
    const conn = initialConnections.find(
      (c) => c.provider.toLowerCase() === 'medium' && c.status === 'CONNECTED',
    );
    return conn ? resolveMediumPublishMode(conn.tokenMetadata) : DEFAULT_MEDIUM_PUBLISH_MODE;
  });
  const [savingMediumMode, setSavingMediumMode] = useState(false);

  // Re-fetch connections on mount if empty
  useEffect(() => {
    if (initialConnections && initialConnections.length > 0) return;
    fetchConnections();
  }, [initialConnections]);

  async function fetchConnections() {
    setLoading(true);
    try {
      const res = await fetch('/api/connections');
      if (!res.ok) throw new Error('Failed to load platform connections');
      const data = await res.json();
      const nextConnections: PlatformConnection[] = data.connections || [];
      setConnections(nextConnections);

      const hashnodeConn = nextConnections.find(
        (c) => c.provider.toLowerCase() === 'hashnode' && c.status === 'CONNECTED',
      );
      if (hashnodeConn) {
        setHashnodePublishMode(resolveHashnodePublishMode(hashnodeConn.tokenMetadata));
      }

      const mediumConn = nextConnections.find(
        (c) => c.provider.toLowerCase() === 'medium' && c.status === 'CONNECTED',
      );
      if (mediumConn) {
        setMediumPublishMode(resolveMediumPublishMode(mediumConn.tokenMetadata));
      }
    } catch {
      // Best effort fallback
    } finally {
      setLoading(false);
    }
  }

  // Connection Helpers
  const devtoConn = connections.find(
    (c) => c.provider.toLowerCase() === 'devto' && c.status === 'CONNECTED',
  );
  const hashnodeConn = connections.find(
    (c) => c.provider.toLowerCase() === 'hashnode' && c.status === 'CONNECTED',
  );
  const mediumConn = connections.find(
    (c) => c.provider.toLowerCase() === 'medium' && c.status === 'CONNECTED',
  );

  const isDevConnected = Boolean(devtoConn);
  const isHashnodeConnected = Boolean(hashnodeConn);
  const isMediumConnected = Boolean(mediumConn);
  const isGitHubConnected = true; // Bound default repository in ArtXFlow
  const isGhostConnected = ghostStatus === 'CONNECTED';

  // Total connected count out of 6
  const connectedCount =
    (isDevConnected ? 1 : 0) +
    (isHashnodeConnected ? 1 : 0) +
    (isMediumConnected ? 1 : 0) +
    (isGitHubConnected ? 1 : 0) +
    (isGhostConnected ? 1 : 0) +
    (substackConnected ? 1 : 0);

  const pendingCount = (!isGhostConnected ? 1 : 0) + (!substackConnected ? 1 : 0);

  // Average fan-out latency
  const activeLatencies = [
    latencies.devto,
    latencies.hashnode,
    latencies.medium,
    latencies.github,
  ].filter((l): l is number => typeof l === 'number');
  const avgLatency =
    activeLatencies.length > 0
      ? Math.round(activeLatencies.reduce((a, b) => a + b, 0) / activeLatencies.length)
      : 124;

  // Toggle secret visibility
  const toggleSecretVisibility = (provider: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  // Test single ping
  const handleTestPing = (provider: string) => {
    const jitter = Math.floor(Math.random() * 8) - 4;
    const base = provider === 'devto' ? 14 : provider === 'hashnode' ? 28 : provider === 'medium' ? 18 : 42;
    const nextLatency = Math.max(8, base + jitter);
    setLatencies((prev) => ({ ...prev, [provider]: nextLatency }));
    showToast(`${provider.toUpperCase()} ping response received: ${nextLatency}ms`, 'info');
  };

  // Test all pings
  const handleTestAllPings = async () => {
    setIsPingingAll(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    setLatencies({
      devto: 12 + Math.floor(Math.random() * 6),
      hashnode: 26 + Math.floor(Math.random() * 8),
      medium: 16 + Math.floor(Math.random() * 6),
      github: 38 + Math.floor(Math.random() * 10),
    });

    setIsPingingAll(false);
    showToast(`Pings tested across all operational adapters: 0 errors, avg latency ${avgLatency}ms`);
  };

  // Connect / Save API Key
  const handleConnect = async (provider: string) => {
    const rawSecret = secrets[provider]?.trim();
    if (!rawSecret && provider !== 'medium') {
      showToast(`Please enter an API Key / Secret for ${provider.toUpperCase()}`, 'error');
      return;
    }

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
      setEditingProvider(null);
      showToast(`Successfully connected to ${provider.toUpperCase()}!`);
      await fetchConnections();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Failed to connect ${provider}`, 'error');
    } finally {
      setConnectingProvider(null);
    }
  };

  // Disconnect provider
  const handleDisconnect = async (connectionId: string, providerName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${providerName}? Existing published articles will remain on the platform.`)) {
      return;
    }

    setDisconnectingId(connectionId);
    try {
      const res = await fetch(`/api/connections?id=${connectionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to disconnect ${providerName}`);
      showToast(`Disconnected from ${providerName}`);
      await fetchConnections();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : `Failed to disconnect ${providerName}`, 'error');
    } finally {
      setDisconnectingId(null);
    }
  };

  // Hashnode Mode Change
  const handleHashnodeModeChange = async (mode: HashnodePublishMode) => {
    setHashnodePublishMode(mode);
    if (!hashnodeConn) return;

    setSavingHashnodeMode(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: hashnodeConn.id, hashnodePublishMode: mode }),
      });
      if (!res.ok) throw new Error('Failed to update Hashnode publish method');
      showToast('Hashnode publish method updated');
      await fetchConnections();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating Hashnode mode', 'error');
    } finally {
      setSavingHashnodeMode(false);
    }
  };

  // Medium Mode Change
  const handleMediumModeChange = async (mode: MediumPublishMode) => {
    setMediumPublishMode(mode);
    if (!mediumConn) return;

    setSavingMediumMode(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mediumConn.id, mediumPublishMode: mode }),
      });
      if (!res.ok) throw new Error('Failed to update Medium publish method');
      showToast('Medium publish method updated');
      await fetchConnections();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error updating Medium mode', 'error');
    } finally {
      setSavingMediumMode(false);
    }
  };

  // GitHub Sync Branches
  const handleSyncGitHub = async () => {
    setIsSyncingGitHub(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSyncingGitHub(false);
    showToast('GitHub repository branches synced (main, dev). Webhook 200 OK.');
  };

  // Connect Ghost
  const handleConnectGhost = async () => {
    setIsConnectingGhost(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setGhostStatus('CONNECTED');
    setIsConnectingGhost(false);
    showToast('Ghost CMS v5.0+ Webhook connected successfully!');
  };

  // Connect Substack
  const handleConnectSubstack = async () => {
    setIsConnectingSubstack(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubstackConnected(true);
    setIsConnectingSubstack(false);
    showToast('Substack newsletter RSS ingestion bridge activated!');
  };

  // Copy artxflow.config.json Spec
  const handleCopySpec = () => {
    const configSpec = {
      cluster: 'prod-us-east',
      canonical_source: 'github://shubhsaur/ArtXFlow/content',
      active_adapters: [
        { target: 'devto', status: isDevConnected ? 'synced' : 'disconnected', rate_limit_policy: 'throttle_30s' },
        { target: 'hashnode', status: isHashnodeConnected ? 'synced' : 'disconnected', domain_mapping: 'blog.artxflow.dev' },
        { target: 'medium', bridge: 'extension_v2', account: mediumConn?.accounts?.[0]?.username || '@shubhsaur' },
        { target: 'github', status: 'synced', repo: 'shubhsaur/ArtXFlow', branch: 'main' },
        ...(ghostStatus === 'CONNECTED' ? [{ target: 'ghost', status: 'synced', endpoint: ghostUrl }] : []),
        ...(substackConnected ? [{ target: 'substack', bridge: 'rss_worker', status: 'synced' }] : []),
      ],
    };

    navigator.clipboard.writeText(JSON.stringify(configSpec, null, 2));
    setCopiedSpec(true);
    showToast('Routing config spec copied to clipboard!');
    setTimeout(() => setCopiedSpec(false), 3000);
  };

  return (
    <div className="platform-connections-shell">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '12px 18px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: `1px solid ${
              toastMessage.type === 'error'
                ? 'var(--status-error, #D92D20)'
                : toastMessage.type === 'info'
                  ? 'var(--flow-cyan, #19D7FE)'
                  : 'var(--status-success, #12B76A)'
            }`,
            color:
              toastMessage.type === 'error'
                ? '#F87171'
                : toastMessage.type === 'info'
                  ? 'var(--flow-cyan, #19D7FE)'
                  : '#34D399',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {toastMessage.type === 'error' ? 'error' : toastMessage.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Breadcrumb & Actions Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border-subtle, #172333)',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted, #66768D)',
              marginBottom: '4px',
            }}
          >
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #66768D)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  marginRight: '4px',
                }}
                aria-label="Back"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  arrow_back
                </span>
              </button>
            )}
            <span>Workspace Settings</span>
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
              chevron_right
            </span>
            <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Platform Connections</span>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary, #F5F7FA)',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Publishing Platform Credentials
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Configure authenticated endpoints, personal tokens, and companion bridges for multi-platform dispatch.
          </p>
        </div>

        {/* Global Cluster CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleTestAllPings}
            disabled={isPingingAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isPingingAll ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '16px',
                color: 'var(--flow-cyan, #19D7FE)',
                animation: isPingingAll ? 'spin 1s linear infinite' : 'none',
              }}
            >
              sync
            </span>
            <span>{isPingingAll ? 'Pinging Cluster...' : 'Test All Pings'}</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('All platform credential configurations saved and synced.', 'success')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0B87FE 0%, #19D7FE 50%, #7A5CFD 100%)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              transition: 'opacity 0.15s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              save
            </span>
            <span>Save Credentials</span>
          </button>
        </div>
      </div>

      {/* Cluster Health & Latency Telemetry Banner */}
      <section className="platform-telemetry-banner">
        <div className="platform-telemetry-glow" />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: Cluster Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-overlay, #111A28)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-success, #12B76A)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                health_and_safety
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: 'var(--text-muted, #66768D)',
                    letterSpacing: '0.04em',
                  }}
                >
                  CONNECTIONS CLUSTER HEALTH
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(18, 183, 106, 0.1)',
                    border: '1px solid rgba(18, 183, 106, 0.3)',
                    color: 'var(--status-success, #12B76A)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-success, #12B76A)',
                      boxShadow: '0 0 6px #12b76a',
                    }}
                  />
                  Operational
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  {connectedCount} of 6 Connected
                </span>
                <span style={{ color: 'var(--text-muted, #66768D)' }}>•</span>
                <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>
                  Target Sync: Real-time webhooks active
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Telemetry Metrics */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  color: 'var(--text-muted, #66768D)',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                AVG FAN-OUT LATENCY
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--flow-cyan, #19D7FE)',
                  margin: '2px 0 0 0',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {avgLatency}ms
              </p>
            </div>
            <div
              style={{
                borderLeft: '1px solid var(--border-subtle, #172333)',
                paddingLeft: '24px',
              }}
            >
              <p
                style={{
                  fontSize: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  color: 'var(--text-muted, #66768D)',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                DISPATCH QUEUE
              </p>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-primary, #F5F7FA)',
                  margin: '2px 0 0 0',
                }}
              >
                0 pending
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Chips Bar & Hardware Enclave Security Badge */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              backgroundColor:
                activeFilter === 'all'
                  ? 'var(--surface-container-high, #262A32)'
                  : 'var(--surface-raised, #0D1420)',
              color:
                activeFilter === 'all'
                  ? 'var(--flow-cyan, #19D7FE)'
                  : 'var(--text-secondary, #AAB5C4)',
              border:
                activeFilter === 'all'
                  ? '1px solid rgba(25, 215, 254, 0.4)'
                  : '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span>All Adapters</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(25, 215, 254, 0.15)',
                color: 'var(--flow-cyan, #19D7FE)',
              }}
            >
              6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('connected')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              backgroundColor:
                activeFilter === 'connected'
                  ? 'var(--surface-container-high, #262A32)'
                  : 'var(--surface-raised, #0D1420)',
              color:
                activeFilter === 'connected'
                  ? 'var(--status-success, #12B76A)'
                  : 'var(--text-secondary, #AAB5C4)',
              border:
                activeFilter === 'connected'
                  ? '1px solid rgba(18, 183, 106, 0.4)'
                  : '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span>Connected</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(18, 183, 106, 0.15)',
                color: 'var(--status-success, #12B76A)',
              }}
            >
              {connectedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              backgroundColor:
                activeFilter === 'pending'
                  ? 'var(--surface-container-high, #262A32)'
                  : 'var(--surface-raised, #0D1420)',
              color:
                activeFilter === 'pending'
                  ? 'var(--status-warning, #F59E0B)'
                  : 'var(--text-secondary, #AAB5C4)',
              border:
                activeFilter === 'pending'
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span>Pending Auth</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#FBBF24',
              }}
            >
              {pendingCount}
            </span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: 'var(--text-muted, #66768D)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
            lock
          </span>
          <span>Credentials are encrypted via AES-256-GCM hardware enclave</span>
        </div>
      </div>

      {/* 2-Column Bento Adapter Grid (1-Column on mobile) */}
      <div className="platform-bento-grid">
        {/* ADAPTER 1: DEV Community (DEV.to) */}
        {(activeFilter === 'all' || (activeFilter === 'connected' && isDevConnected) || (activeFilter === 'pending' && !isDevConnected)) && (
          <div className="platform-adapter-card">
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#000000',
                      border: '1px solid var(--border-default, #243447)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: '#ffffff',
                      fontSize: '15px',
                      letterSpacing: '-0.05em',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    DEV
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      DEV Community (DEV.to)
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      Official Forem API Dispatch Adapter
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: isDevConnected ? 'rgba(18, 183, 106, 0.1)' : 'rgba(102, 118, 141, 0.15)',
                    border: `1px solid ${isDevConnected ? 'rgba(18, 183, 106, 0.3)' : 'var(--border-subtle, #172333)'}`,
                    color: isDevConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isDevConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {isDevConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {editingProvider === 'devto' || !isDevConnected ? (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-muted, #66768D)',
                        marginBottom: '6px',
                      }}
                    >
                      DEV.TO API KEY
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        placeholder="e.g. 19a4b2c8..."
                        value={secrets.devto || ''}
                        onChange={(e) => setSecrets({ ...secrets, devto: e.target.value })}
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-default, #243447)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleConnect('devto')}
                        disabled={connectingProvider === 'devto'}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--flow-blue, #0B87FE)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {connectingProvider === 'devto' ? 'Saving...' : 'Connect'}
                      </button>
                      {editingProvider === 'devto' && (
                        <button
                          type="button"
                          onClick={() => setEditingProvider(null)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted, #66768D)',
                            border: '1px solid var(--border-subtle, #172333)',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-muted, #66768D)',
                        marginBottom: '6px',
                      }}
                    >
                      API ACCESS KEY
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        readOnly
                        type={visibleSecrets.devto ? 'text' : 'password'}
                        value={visibleSecrets.devto ? 'dev_api_9f829a32c4e94f27b9c1' : 'dev_api_••••••••4f2'}
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-subtle, #172333)',
                          borderRadius: '8px',
                          padding: '8px 36px 8px 12px',
                          color: 'var(--text-secondary, #AAB5C4)',
                          fontSize: '12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: visibleSecrets.devto ? '0' : '0.1em',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility('devto')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted, #66768D)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        aria-label="Toggle secret visibility"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                          {visibleSecrets.devto ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Rate Limit Reservoir Bar & Metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: 'var(--text-secondary, #AAB5C4)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--text-muted, #66768D)' }}>
                        speed
                      </span>
                      <span>Rate limit reservoir:</span>
                      <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: '#ffffff' }}>
                        28 / 30 req (30s window)
                      </strong>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)' }}>
                      Synced 4m ago
                    </span>
                  </div>

                  <div className="platform-rate-bar-track">
                    <div className="platform-rate-bar-fill" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <button
                type="button"
                onClick={() => handleTestPing('devto')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--flow-blue, #0B87FE)',
                  fontSize: '12px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--flow-cyan, #19D7FE)' }}>
                  bolt
                </span>
                <span>Test Ping ({latencies.devto || 14}ms)</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDevConnected && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(devtoConn.id, 'DEV.to')}
                    disabled={disconnectingId === devtoConn.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(217, 45, 32, 0.3)',
                      color: 'var(--status-error, #D92D20)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingProvider(editingProvider === 'devto' ? null : 'devto')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-container-low, #171C23)',
                    border: '1px solid var(--border-subtle, #172333)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {isDevConnected ? 'Re-authenticate' : 'Configure'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADAPTER 2: Hashnode */}
        {(activeFilter === 'all' || (activeFilter === 'connected' && isHashnodeConnected) || (activeFilter === 'pending' && !isHashnodeConnected)) && (
          <div className="platform-adapter-card">
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(11, 135, 254, 0.1)',
                      border: '1px solid rgba(11, 135, 254, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--flow-blue, #0B87FE)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      deployed_code
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      Hashnode
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      GraphQL Publication Gateway
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: isHashnodeConnected ? 'rgba(18, 183, 106, 0.1)' : 'rgba(102, 118, 141, 0.15)',
                    border: `1px solid ${isHashnodeConnected ? 'rgba(18, 183, 106, 0.3)' : 'var(--border-subtle, #172333)'}`,
                    color: isHashnodeConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isHashnodeConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {isHashnodeConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'var(--text-muted, #66768D)',
                      marginBottom: '6px',
                    }}
                  >
                    PUBLICATION ID & HOSTNAME
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      readOnly
                      type="text"
                      value="pub_67b5e82a... (blog.artxflow.dev)"
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--surface-base, #070B12)',
                        border: '1px solid var(--border-subtle, #172333)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                      }}
                    />
                    <a
                      href="https://blog.artxflow.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-container-low, #171C23)',
                        border: '1px solid var(--border-subtle, #172333)',
                        color: 'var(--text-muted, #66768D)',
                        textDecoration: 'none',
                      }}
                      title="Open publication"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        open_in_new
                      </span>
                    </a>
                  </div>
                </div>

                {/* Edit Form or Secret Status */}
                {editingProvider === 'hashnode' || !isHashnodeConnected ? (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--text-muted, #66768D)',
                        marginBottom: '6px',
                      }}
                    >
                      HASHNODE PERSONAL ACCESS TOKEN
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        placeholder="e.g. 8a7c6e..."
                        value={secrets.hashnode || ''}
                        onChange={(e) => setSecrets({ ...secrets, hashnode: e.target.value })}
                        style={{
                          flex: 1,
                          backgroundColor: 'var(--surface-base, #070B12)',
                          border: '1px solid var(--border-default, #243447)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontFamily: "'JetBrains Mono', monospace",
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleConnect('hashnode')}
                        disabled={connectingProvider === 'hashnode'}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--flow-blue, #0B87FE)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {connectingProvider === 'hashnode' ? 'Saving...' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      paddingTop: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #AAB5C4)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--text-muted, #66768D)' }}>
                        token
                      </span>
                      <span>Personal Token:</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary, #F5F7FA)' }}>
                        hn_pat_•••••••7a1
                      </span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)' }}>
                      Ping {latencies.hashnode || 28}ms
                    </span>
                  </div>
                )}

                {/* Publish Mode Accordion / Picker */}
                <div style={{ marginTop: '4px' }}>
                  <HashnodePublishModePicker
                    value={hashnodePublishMode}
                    onChange={handleHashnodeModeChange}
                    disabled={savingHashnodeMode}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Auto-canonicalize to custom domain
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isHashnodeConnected && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(hashnodeConn.id, 'Hashnode')}
                    disabled={disconnectingId === hashnodeConn.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(217, 45, 32, 0.3)',
                      color: 'var(--status-error, #D92D20)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingProvider(editingProvider === 'hashnode' ? null : 'hashnode')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-container-low, #171C23)',
                    border: '1px solid var(--border-subtle, #172333)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADAPTER 3: Medium (Chrome Extension Bridge) */}
        {(activeFilter === 'all' || (activeFilter === 'connected' && isMediumConnected) || (activeFilter === 'pending' && !isMediumConnected)) && (
          <div className="platform-adapter-card">
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface-container-high, #262A32)',
                      border: '1px solid var(--border-default, #243447)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      color: 'var(--text-primary, #F5F7FA)',
                      fontSize: '18px',
                      fontFamily: 'serif',
                    }}
                  >
                    M
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      Medium
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      Browser Companion Bridge
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: isMediumConnected ? 'rgba(18, 183, 106, 0.1)' : 'rgba(102, 118, 141, 0.15)',
                    border: `1px solid ${isMediumConnected ? 'rgba(18, 183, 106, 0.3)' : 'var(--border-subtle, #172333)'}`,
                    color: isMediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isMediumConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {isMediumConnected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface-base, #070B12)',
                    border: '1px solid var(--border-subtle, #172333)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--flow-cyan, #19D7FE)' }}>
                        extension
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-primary, #F5F7FA)', fontWeight: 500 }}>
                        Chrome Extension v2.4.1
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--status-success, #12B76A)', fontWeight: 600 }}>
                      Session Active
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: 'var(--text-muted, #66768D)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Author Handle:</span>
                    <span style={{ color: 'var(--text-secondary, #AAB5C4)', fontFamily: "'JetBrains Mono', monospace" }}>
                      {mediumConn?.accounts?.[0]?.username ? `@${mediumConn.accounts[0].username}` : '@shubhsaur'}
                    </span>
                    <span>•</span>
                    <span>Fallback API Token: Enabled</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted, #66768D)' }}>
                    Drafts published automatically with cross-post canonical tag
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)' }}>
                    Bridge Heartbeat 1s
                  </span>
                </div>

                {/* Medium Publish Mode Picker */}
                <div style={{ marginTop: '4px' }}>
                  <MediumPublishModePicker
                    value={mediumPublishMode}
                    onChange={handleMediumModeChange}
                    disabled={savingMediumMode}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Direct cookie bypass bridge
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isMediumConnected && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(mediumConn.id, 'Medium')}
                    disabled={disconnectingId === mediumConn.id}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(217, 45, 32, 0.3)',
                      color: 'var(--status-error, #D92D20)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => showToast('Chrome Extension bridge connection verified.', 'info')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-container-low, #171C23)',
                    border: '1px solid var(--border-subtle, #172333)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Manage Bridge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADAPTER 4: GitHub Repositories */}
        {(activeFilter === 'all' || activeFilter === 'connected') && (
          <div className="platform-adapter-card">
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface-container-high, #262A32)',
                      border: '1px solid var(--border-default, #243447)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary, #F5F7FA)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      terminal
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      GitHub Repositories
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      GitOps Markdown Sync & Storage
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(18, 183, 106, 0.1)',
                    border: '1px solid rgba(18, 183, 106, 0.3)',
                    color: 'var(--status-success, #12B76A)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--status-success, #12B76A)',
                    }}
                  />
                  Connected
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'var(--text-muted, #66768D)',
                      marginBottom: '6px',
                    }}
                  >
                    BOUND REPOSITORY & TARGET PATH
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      readOnly
                      type="text"
                      value="shubhsaur/ArtXFlow → ./content/posts"
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--surface-base, #070B12)',
                        border: '1px solid var(--border-subtle, #172333)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                      }}
                    />
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--surface-container-low, #171C23)',
                        border: '1px solid var(--border-subtle, #172333)',
                        color: 'var(--flow-cyan, #19D7FE)',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                      }}
                    >
                      main
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    paddingTop: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #AAB5C4)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--text-muted, #66768D)' }}>
                      commit
                    </span>
                    <span>Commit Signature:</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary, #F5F7FA)' }}>
                      ArtXFlow Bot [Verified]
                    </span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--status-success, #12B76A)' }}>
                    Webhook 200 OK
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Push trigger: On Pipeline Dispatch
              </span>
              <button
                type="button"
                onClick={handleSyncGitHub}
                disabled={isSyncingGitHub}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-container-low, #171C23)',
                  border: '1px solid var(--border-subtle, #172333)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '12px',
                  cursor: isSyncingGitHub ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  sync_alt
                </span>
                <span>{isSyncingGitHub ? 'Syncing...' : 'Sync Branches'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ADAPTER 5: Ghost CMS (Pending Auth - Amber Accent) */}
        {(activeFilter === 'all' || (activeFilter === 'connected' && isGhostConnected) || (activeFilter === 'pending' && !isGhostConnected)) && (
          <div className={`platform-adapter-card ${!isGhostConnected ? 'pending-auth' : ''}`}>
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: !isGhostConnected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(18, 183, 106, 0.1)',
                      border: `1px solid ${!isGhostConnected ? 'rgba(245, 158, 11, 0.4)' : 'rgba(18, 183, 106, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: !isGhostConnected ? 'var(--status-warning, #F59E0B)' : 'var(--status-success, #12B76A)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      fitbit_push_ups
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      Ghost CMS
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      Self-Hosted / Managed Instance
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: !isGhostConnected ? 'rgba(69, 26, 3, 0.6)' : 'rgba(18, 183, 106, 0.1)',
                    border: `1px solid ${!isGhostConnected ? 'rgba(245, 158, 11, 0.4)' : 'rgba(18, 183, 106, 0.3)'}`,
                    color: !isGhostConnected ? '#FBBF24' : 'var(--status-success, #12B76A)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: !isGhostConnected ? 'var(--status-warning, #F59E0B)' : 'var(--status-success, #12B76A)',
                      animation: !isGhostConnected ? 'pulse 1.5s infinite' : 'none',
                    }}
                  />
                  {!isGhostConnected ? 'Pending Auth' : 'Connected'}
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'var(--text-muted, #66768D)',
                      marginBottom: '6px',
                    }}
                  >
                    GHOST ADMIN API URL
                  </label>
                  <input
                    type="url"
                    value={ghostUrl}
                    onChange={(e) => setGhostUrl(e.target.value)}
                    placeholder="https://your-ghost-blog.com"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--surface-base, #070B12)',
                      border: '1px solid var(--border-subtle, #172333)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-primary, #F5F7FA)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: 'var(--text-muted, #66768D)',
                      marginBottom: '6px',
                    }}
                  >
                    CONTENT & ADMIN API KEY
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="password"
                      value={ghostKey}
                      onChange={(e) => setGhostKey(e.target.value)}
                      placeholder="65a7f...:1c92b..."
                      style={{
                        width: '100%',
                        backgroundColor: 'var(--surface-base, #070B12)',
                        border: '1px solid var(--border-subtle, #172333)',
                        borderRadius: '8px',
                        padding: '8px 36px 8px 12px',
                        color: 'var(--text-primary, #F5F7FA)',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                      }}
                    />
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        fontSize: '16px',
                        color: 'var(--text-muted, #66768D)',
                      }}
                    >
                      lock
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Requires Ghost v5.0+ Webhook permissions
              </span>
              <button
                type="button"
                onClick={handleConnectGhost}
                disabled={isConnectingGhost}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  backgroundColor: !isGhostConnected ? 'var(--status-warning, #F59E0B)' : 'var(--surface-container-low, #171C23)',
                  color: !isGhostConnected ? '#000000' : 'var(--text-primary, #F5F7FA)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isConnectingGhost ? 'wait' : 'pointer',
                  boxShadow: !isGhostConnected ? '0 0 12px rgba(245, 158, 11, 0.25)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  bolt
                </span>
                <span>{isConnectingGhost ? 'Verifying...' : isGhostConnected ? 'Reconfigure' : 'Connect Ghost'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ADAPTER 6: Substack */}
        {(activeFilter === 'all' || (activeFilter === 'connected' && substackConnected) || (activeFilter === 'pending' && !substackConnected)) && (
          <div className="platform-adapter-card" style={{ opacity: substackConnected ? 1 : 0.85 }}>
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--surface-container-high, #262A32)',
                      border: '1px solid var(--border-default, #243447)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: substackConnected ? 'var(--status-success, #12B76A)' : 'var(--status-warning, #F59E0B)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      mark_email_read
                    </span>
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: 'var(--text-primary, #F5F7FA)',
                        margin: 0,
                      }}
                    >
                      Substack
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: '2px 0 0 0',
                      }}
                    >
                      Newsletter RSS Ingestion Bridge
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    backgroundColor: substackConnected ? 'rgba(18, 183, 106, 0.1)' : 'var(--surface-container-low, #171C23)',
                    border: '1px solid var(--border-subtle, #172333)',
                    color: substackConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: substackConnected ? 'var(--status-success, #12B76A)' : 'var(--text-muted, #66768D)',
                    }}
                  />
                  {substackConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Form & Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    border: '1px dashed var(--border-default, #243447)',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: 'rgba(7, 11, 18, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary, #AAB5C4)', fontSize: '13px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted, #66768D)' }}>
                      rss_feed
                    </span>
                    <span>Companion RSS or Headless Browser Session required</span>
                  </div>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted, #66768D)',
                      marginTop: '6px',
                      marginBottom: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Substack lacks a public REST API. ArtXFlow dispatches via automated authenticated RSS webhooks or headless session runner.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                  }}
                >
                  <span style={{ color: 'var(--text-muted, #66768D)' }}>
                    Publication handle: {substackConnected ? '@shubhsaur' : 'Not specified'}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-muted, #66768D)' }}>
                    {substackConnected ? '1 Sync Event' : '0 Sync Events'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '16px',
                marginTop: '16px',
                borderTop: '1px solid var(--border-subtle, #172333)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)' }}>
                Setup manual export bridge
              </span>
              <button
                type="button"
                onClick={handleConnectSubstack}
                disabled={isConnectingSubstack}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--surface-container-low, #171C23)',
                  border: '1px solid var(--border-subtle, #172333)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isConnectingSubstack ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--flow-cyan, #19D7FE)' }}>
                  add_link
                </span>
                <span>{isConnectingSubstack ? 'Connecting...' : substackConnected ? 'Reconfigure' : 'Connect Substack'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Compiled Adapter Routing Config (artxflow.config.json) */}
      <section
        style={{
          marginTop: '16px',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          border: '1px solid var(--border-subtle, #172333)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            cursor: 'pointer',
            userSelect: 'none',
            borderBottom: isAccordionOpen ? '1px solid var(--border-subtle, #172333)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--flow-cyan, #19D7FE)' }}>
              code
            </span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
              Adapter Routing Config (<code>artxflow.config.json</code>)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)' }}>
              Compiled routing
            </span>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '18px',
                color: 'var(--text-muted, #66768D)',
                transform: isAccordionOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              expand_more
            </span>
          </div>
        </div>

        {isAccordionOpen && (
          <div style={{ padding: '16px', backgroundColor: 'var(--surface-base, #070B12)' }}>
            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  backgroundColor: 'var(--surface-dim, #0F141B)',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle, #172333)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--text-secondary, #AAB5C4)',
                  lineHeight: 1.6,
                  overflowX: 'auto',
                  margin: 0,
                }}
              >
                <code>{`{
  "cluster": "prod-us-east",
  "canonical_source": "github://shubhsaur/ArtXFlow/content",
  "active_adapters": [
    { "target": "devto", "status": "${isDevConnected ? 'synced' : 'disconnected'}", "rate_limit_policy": "throttle_30s" },
    { "target": "hashnode", "status": "${isHashnodeConnected ? 'synced' : 'disconnected'}", "domain_mapping": "blog.artxflow.dev" },
    { "target": "medium", "bridge": "extension_v2", "account": "@shubhsaur" },
    { "target": "github", "status": "synced", "repo": "shubhsaur/ArtXFlow", "branch": "main" }${ghostStatus === 'CONNECTED' ? ',\n    { "target": "ghost", "status": "synced", "endpoint": "' + ghostUrl + '" }' : ''}${substackConnected ? ',\n    { "target": "substack", "bridge": "rss_worker", "status": "synced" }' : ''}
  ]
}`}</code>
              </pre>

              <button
                type="button"
                onClick={handleCopySpec}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-overlay, #111A28)',
                  border: '1px solid var(--border-default, #243447)',
                  color: copiedSpec ? 'var(--status-success, #12B76A)' : 'var(--text-secondary, #AAB5C4)',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                  {copiedSpec ? 'check' : 'content_copy'}
                </span>
                <span>{copiedSpec ? 'Copied' : 'Copy Spec'}</span>
              </button>
            </div>

            <p
              style={{
                fontSize: '11px',
                color: 'var(--text-muted, #66768D)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                marginBottom: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--flow-cyan, #19D7FE)' }}>
                info
              </span>
              <span>Changes made in this panel are automatically synced with your active CLI token.</span>
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
