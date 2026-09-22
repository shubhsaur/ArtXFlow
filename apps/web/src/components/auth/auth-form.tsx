'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthOAuthButtons } from './auth-oauth-buttons';
import { AuthSignInFields } from './auth-signin-fields';
import { AuthSignUpFields } from './auth-signup-fields';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function getPasswordStrength(password: string) {
  if (!password) {
    return { score: 0, label: '', color: 'transparent', feedback: '' };
  }
  let checks = 0;
  if (password.length >= 8) checks += 1;
  if (password.length >= 12) checks += 1;
  if (/[0-9]/.test(password)) checks += 1;
  if (/[^a-zA-Z0-9]/.test(password)) checks += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) checks += 1;

  if (checks <= 1) {
    return { score: 1, label: 'Weak (min. 8 chars, 1 uppercase, 1 symbol)', color: 'var(--status-error, #D92D20)', feedback: 'Add an uppercase letter, number, and symbol to increase security.' };
  }
  if (checks === 2) {
    return { score: 2, label: 'Fair (add numbers & symbols)', color: 'var(--secondary, #F59E0B)', feedback: 'Add more varied characters for stronger security.' };
  }
  if (checks <= 4) {
    return { score: 3, label: 'Good (secure password)', color: 'var(--flow-cyan, #19D7FE)', feedback: 'Secure password criteria met.' };
  }
  return { score: 4, label: 'Very Strong', color: 'var(--status-success, #12B76A)', feedback: 'Excellent cryptographic entropy.' };
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup';

  const [isSignUp, setIsSignUp] = useState(initialMode);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Create Workspace (Sign Up) Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(signUpPassword),
    [signUpPassword]
  );

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsSignUp(true);
    }
  }, [searchParams]);

  function clearErrors() {
    setFieldErrors({});
    setServerError(null);
  }

  function switchTab(toSignUp: boolean) {
    if (toSignUp === isSignUp) return;
    setIsSignUp(toSignUp);
    clearErrors();
    const url = toSignUp ? '/login?mode=signup' : '/login';
    window.history.replaceState(null, '', url);
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isSignUp) {
      if (!signUpName.trim()) {
        errors.name = 'Please enter your full name';
      }

      if (!signUpEmail.trim()) {
        errors.email = 'Work email address is required';
      } else if (!emailRegex.test(signUpEmail.trim())) {
        errors.email = 'Please enter a valid email address';
      }

      if (!signUpPassword) {
        errors.password = 'Password is required';
      } else if (signUpPassword.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }

      if (!signUpConfirmPassword) {
        errors.confirmPassword = 'Confirmation password is required';
      } else if (signUpPassword !== signUpConfirmPassword) {
        errors.confirmPassword = 'Passwords do not match. Please verify your password.';
      }
    } else {
      if (!signInEmail.trim()) {
        errors.email = 'Work email address is required';
      } else if (!emailRegex.test(signInEmail.trim())) {
        errors.email = 'Please enter a valid email address';
      }

      if (!signInPassword) {
        errors.password = 'Password is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignUp ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email';
      const body = isSignUp
        ? {
            email: signUpEmail.trim(),
            password: signUpPassword,
            name: signUpName.trim() || signUpEmail.split('@')[0],
          }
        : {
            email: signInEmail.trim(),
            password: signInPassword,
            rememberMe,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your credentials.');
      }

      if (isSignUp) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialSignIn(provider: 'github' | 'google') {
    clearErrors();
    setLoading(true);
    try {
      const callbackURL = isSignUp ? '/onboarding' : '/dashboard';
      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, callbackURL }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `${provider} sign-in is not configured yet.`);
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Social sign-in failed');
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      {/* Auth Heading */}
      <div style={{ marginBottom: '24px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: "'Geist', sans-serif",
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
            margin: '0 0 6px 0',
          }}
        >
          {isSignUp ? 'Create your ArtXFlow Workspace' : 'Welcome back to ArtXFlow'}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)', margin: 0, lineHeight: 1.5 }}>
          {isSignUp
            ? 'Start orchestrating multi-platform canonical publishing.'
            : 'Enter your credentials to access your distribution pipelines.'}
        </p>
      </div>

      {/* Mode Tab Switcher */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          padding: '4px',
          backgroundColor: 'var(--surface-base, #070B12)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle, #172333)',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          onClick={() => switchTab(false)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Geist', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            border: !isSignUp ? '1px solid var(--border-default, #243447)' : '1px solid transparent',
            backgroundColor: !isSignUp ? 'var(--surface-raised, #0D1420)' : 'transparent',
            color: !isSignUp ? 'var(--text-primary, #F5F7FA)' : 'var(--text-secondary, #AAB5C4)',
            boxShadow: !isSignUp ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            login
          </span>
          <span>Sign In</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          onClick={() => switchTab(true)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Geist', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            border: isSignUp ? '1px solid var(--border-default, #243447)' : '1px solid transparent',
            backgroundColor: isSignUp ? 'var(--surface-raised, #0D1420)' : 'transparent',
            color: isSignUp ? 'var(--text-primary, #F5F7FA)' : 'var(--text-secondary, #AAB5C4)',
            boxShadow: isSignUp ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            add_box
          </span>
          <span>Create Workspace</span>
        </button>
      </div>

      {/* OAuth Providers Suite */}
      <AuthOAuthButtons onSocialSignIn={handleSocialSignIn} loading={loading} />

      {/* Divider */}
      <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'var(--border-subtle, #172333)',
          }}
        />
        <span
          style={{
            position: 'relative',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            padding: '0 12px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--text-muted, #66768D)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          or continue with work email
        </span>
      </div>

      {/* Server Error Alert Banner */}
      {serverError && (
        <div
          role="alert"
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(217, 45, 32, 0.1)',
            border: '1px solid rgba(217, 45, 32, 0.35)',
            color: 'var(--status-error, #D92D20)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0 }}>
            error
          </span>
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Submission */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {isSignUp ? (
          <AuthSignUpFields
            name={signUpName}
            setName={setSignUpName}
            email={signUpEmail}
            setEmail={setSignUpEmail}
            password={signUpPassword}
            setPassword={setSignUpPassword}
            confirmPassword={signUpConfirmPassword}
            setConfirmPassword={setSignUpConfirmPassword}
            showPassword={showSignUpPassword}
            setShowPassword={setShowSignUpPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            passwordStrength={passwordStrength}
            fieldErrors={fieldErrors}
          />
        ) : (
          <AuthSignInFields
            email={signInEmail}
            setEmail={setSignInEmail}
            password={signInPassword}
            setPassword={setSignInPassword}
            showPassword={showSignInPassword}
            setShowPassword={setShowSignInPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            fieldErrors={fieldErrors}
          />
        )}

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            height: '44px',
            marginTop: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary, #0B62F5)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: "'Geist', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: 'none',
            boxShadow: '0 4px 16px rgba(11, 98, 245, 0.35)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.15s ease',
          }}
        >
          <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Workspace' : 'Sign In to Workspace'}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>

        {isSignUp && (
          <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', textAlign: 'center', margin: '4px 0 0 0', lineHeight: 1.5 }}>
            By continuing, you agree to our{' '}
            <a href="#terms" style={{ color: 'var(--flow-cyan, #19D7FE)', textDecoration: 'none' }}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" style={{ color: 'var(--flow-cyan, #19D7FE)', textDecoration: 'none' }}>
              Privacy Policy
            </a>
            .
          </p>
        )}
      </form>

      {/* Open Source Project Reference */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle, #172333)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '10px',
        }}
      >
        <a
          href="https://github.com/shubhsaur/ArtXFlow"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'var(--text-secondary, #AAB5C4)',
            textDecoration: 'none',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--flow-cyan, #19D7FE)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary, #AAB5C4)')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--flow-cyan, #19D7FE)' }}>
            code
          </span>
          <span>Open Source on GitHub</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            arrow_forward
          </span>
        </a>

        <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', maxWidth: '340px', margin: 0, lineHeight: 1.5 }}>
          Powered by Better Auth • Credentials encrypted at rest
        </p>
      </div>
    </div>
  );
}
