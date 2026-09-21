'use client';

import React from 'react';
import Link from 'next/link';

interface AuthSignInFieldsProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  fieldErrors: { email?: string; password?: string };
}

export function AuthSignInFields({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  fieldErrors,
}: AuthSignInFieldsProps) {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <>
      {/* Email Address */}
      <div>
        <label
          htmlFor="signin-email"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '6px',
          }}
        >
          Email Address
        </label>
        <div style={{ position: 'relative' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              color: 'var(--text-muted, #66768D)',
              pointerEvents: 'none',
            }}
          >
            mail
          </span>
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '38px',
              paddingRight: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: fieldErrors.email
                ? '1px solid var(--status-error, #D92D20)'
                : '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '13px',
              fontFamily: "'Geist', sans-serif",
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          {isEmailValid && (
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: 'var(--status-success, #12B76A)',
                pointerEvents: 'none',
              }}
            >
              check_circle
            </span>
          )}
        </div>
        {fieldErrors.email && (
          <span style={{ fontSize: '11px', color: 'var(--status-error, #D92D20)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.email}
          </span>
        )}
      </div>

      {/* Password with Show/Hide & Forgot Password Link */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label
            htmlFor="signin-password"
            style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}
          >
            Password
          </label>
          <Link
            href="/forgot-password"
            style={{
              fontSize: '12px',
              color: 'var(--flow-cyan, #19D7FE)',
              textDecoration: 'none',
            }}
          >
            Forgot password?
          </Link>
        </div>
        <div style={{ position: 'relative' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '18px',
              color: 'var(--text-muted, #66768D)',
              pointerEvents: 'none',
            }}
          >
            lock
          </span>
          <input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '38px',
              paddingRight: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: fieldErrors.password
                ? '1px solid var(--status-error, #D92D20)'
                : '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '13px',
              fontFamily: "'Geist', sans-serif",
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--text-muted, #66768D)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {fieldErrors.password && (
          <span style={{ fontSize: '11px', color: 'var(--status-error, #D92D20)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.password}
          </span>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            accentColor: 'var(--primary, #0B62F5)',
            cursor: 'pointer',
          }}
        />
        <label
          htmlFor="remember-me"
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary, #AAB5C4)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          Remember this device for 30 days
        </label>
      </div>
    </>
  );
}
