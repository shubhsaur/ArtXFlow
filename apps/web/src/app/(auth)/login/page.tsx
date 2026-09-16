'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Logo,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@artxflow/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      const body = isSignUp
        ? { email, password, name: name || email.split('@')[0] }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-primary, #070B12)',
      }}
    >
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Logo size={36} showWordmark={true} />
        <p
          style={{
            marginTop: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary, #AAB5C4)',
          }}
        >
          Write once. Flow everywhere.
        </p>
      </div>

      <Card style={{ width: '100%', maxWidth: '420px' }}>
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create your account' : 'Sign in to ArtXFlow'}</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Get started with your personal workspace'
              : 'Enter your credentials to access your dashboard'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: '#FCA5A5',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    marginBottom: '6px',
                    color: 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md, 8px)',
                    backgroundColor: 'var(--surface-elevated, #131E2F)',
                    border: '1px solid var(--border, #1C2A3A)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '6px',
                  color: 'var(--text-primary, #F5F7FA)',
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  marginBottom: '6px',
                  color: 'var(--text-primary, #F5F7FA)',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '8px' }}>
              {isSignUp ? 'Create Workspace' : 'Sign In'}
            </Button>
          </form>

          <div
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--text-secondary, #AAB5C4)',
            }}
          >
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--axf-cyan, #19D7FE)',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '0',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
