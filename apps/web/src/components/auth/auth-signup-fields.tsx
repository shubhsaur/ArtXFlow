'use client';

import React from 'react';

interface AuthSignUpFieldsProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (val: boolean) => void;
  passwordStrength: { score: number; label: string; color: string; feedback: string };
  fieldErrors: { name?: string; email?: string; password?: string; confirmPassword?: string };
}

export function AuthSignUpFields({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  fieldErrors,
}: AuthSignUpFieldsProps) {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <>
      {/* 1. Full Name */}
      <div>
        <label
          htmlFor="signup-name"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '6px',
          }}
        >
          Full Name
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
            person
          </span>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '38px',
              paddingRight: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border: fieldErrors.name
                ? '1px solid var(--status-error, #D92D20)'
                : '1px solid var(--border-default, #243447)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '13px',
              fontFamily: "'Geist', sans-serif",
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
          />
          {name.trim().length > 1 && (
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
        {fieldErrors.name && (
          <span style={{ fontSize: '11px', color: 'var(--status-error, #D92D20)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.name}
          </span>
        )}
      </div>

      {/* 2. Email Address */}
      <div>
        <label
          htmlFor="signup-email"
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
            id="signup-email"
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

      {/* 3. Password with Strength Meter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label
            htmlFor="signup-password"
            style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary, #F5F7FA)' }}
          >
            Password
          </label>
          {passwordStrength.label && (
            <span
              style={{
                fontSize: '11px',
                fontFamily: "'JetBrains Mono', monospace",
                color: passwordStrength.color,
                fontWeight: 500,
              }}
            >
              {passwordStrength.label}
            </span>
          )}
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
            id="signup-password"
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

        {/* Segmented Strength Meter */}
        {password && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '6px' }}>
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor:
                      step <= passwordStrength.score ? passwordStrength.color : 'var(--surface-overlay, #111A28)',
                    transition: 'background-color 0.2s ease',
                  }}
                />
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
              {passwordStrength.feedback}
            </p>
          </div>
        )}

        {fieldErrors.password && (
          <span style={{ fontSize: '11px', color: 'var(--status-error, #D92D20)', marginTop: '4px', display: 'block' }}>
            {fieldErrors.password}
          </span>
        )}
      </div>

      {/* 4. Confirm Password */}
      <div>
        <label
          htmlFor="signup-confirm-password"
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary, #F5F7FA)',
            marginBottom: '6px',
          }}
        >
          Confirm Password
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
            lock_reset
          </span>
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '38px',
              paddingRight: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--surface-base, #070B12)',
              border:
                confirmPassword && password !== confirmPassword
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
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {showConfirmPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--status-error, #D92D20)',
              fontSize: '11px',
              marginTop: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              warning
            </span>
            <span>Passwords do not match. Please verify your password.</span>
          </div>
        )}
      </div>
    </>
  );
}
