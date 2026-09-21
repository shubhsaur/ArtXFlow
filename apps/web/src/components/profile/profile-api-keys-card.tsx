'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ButtonSpinner } from '../button-spinner';

const AVAILABLE_SCOPES = [
  { value: 'articles:read', label: 'Read articles list', description: 'GET /api/v1/articles' },
  { value: 'articles:read:versions', label: 'Read article content', description: 'GET /api/v1/articles/:id' },
  { value: 'articles:read:publications', label: 'Read publication links', description: 'GET /api/v1/articles/:id/publications' },
  { value: 'profile:read', label: 'Read profile', description: 'GET /api/v1/profile' },
];

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

export function ProfileApiKeysCard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<{ name: string; key: string } | null>(null);
  const [formName, setFormName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['articles:read']);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/user/api-keys');
      const data = await res.json();
      setKeys(data.keys || []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, scopes: selectedScopes }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey({ name: data.key.name, key: data.plaintextKey });
        setFormName('');
        await fetchKeys();
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    const res = await fetch(`/api/user/api-keys/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchKeys();
    }
  };

  return (
    <div className="profile-card" style={{ marginTop: '24px' }}>
      <div className="profile-card-header">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)', margin: 0 }}>
            API Keys
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', marginTop: '4px', marginBottom: 0 }}>
            Generate keys to access your data from external clients like your portfolio website.
          </p>
        </div>
      </div>

      {newKey && (
        <div
          style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(18, 183, 106, 0.1)',
            border: '1px solid rgba(18, 183, 106, 0.3)',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--status-success, #12B76A)' }}>
            Copy this key now — you won’t see it again.
          </span>
          <code
            style={{
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-base, #070B12)',
              color: 'var(--flow-cyan, #19D7FE)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
              wordBreak: 'break-all',
            }}
          >
            {newKey.key}
          </code>
          <button
            type="button"
            onClick={() => setNewKey(null)}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-container, #1C2027)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Done
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
            Key name
          </label>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Portfolio Website"
            required
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
            Scopes
          </label>
          <div style={{ display: 'grid', gap: '10px' }}>
            {AVAILABLE_SCOPES.map((scope) => (
              <label
                key={scope.value}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle, #172333)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedScopes.includes(scope.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedScopes((prev) => [...prev, scope.value]);
                    } else {
                      setSelectedScopes((prev) => prev.filter((s) => s !== scope.value));
                    }
                  }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}>
                    {scope.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {scope.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreating || !formName}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            alignSelf: 'flex-start',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'var(--primary, #0B62F5)',
            border: '1px solid var(--primary, #0B62F5)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: isCreating || !formName ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.8 : 1,
          }}
        >
          {isCreating && <ButtonSpinner color="#FFFFFF" />}
          <span>{isCreating ? 'Creating...' : 'Generate API Key'}</span>
        </button>
      </form>

      {isLoading ? (
        <p style={{ color: 'var(--text-muted, #66768D)', fontSize: '13px' }}>Loading keys...</p>
      ) : keys.length === 0 ? (
        <p style={{ color: 'var(--text-muted, #66768D)', fontSize: '13px' }}>No API keys yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {keys.map((key) => (
            <div
              key={key.id}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-container, #1C2027)',
                border: '1px solid var(--border-default, #243447)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  {key.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', marginTop: '2px' }}>
                  {key.keyPrefix}... • {key.scopes.join(', ')} • created{' '}
                  {new Date(key.createdAt).toLocaleDateString()}
                  {key.revokedAt && ' • revoked'}
                </div>
              </div>
              {!key.revokedAt && (
                <button
                  type="button"
                  onClick={() => handleRevoke(key.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-default, #243447)',
                    color: 'var(--status-error, #D92D20)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
