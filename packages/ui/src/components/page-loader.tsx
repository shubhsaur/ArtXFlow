import React from 'react';
import { Logo } from './logo';

export interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLogo?: boolean;
}

export function PageLoader({
  message = 'Loading ArtXFlow...',
  fullScreen = true,
  size = 'md',
  showLogo = true,
  className = '',
  style,
  ...props
}: PageLoaderProps) {
  const logoSize = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
  const trackWidth = size === 'sm' ? '140px' : size === 'lg' ? '240px' : '180px';
  const fontSize = size === 'sm' ? '13px' : size === 'lg' ? '15px' : '14px';

  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'var(--bg-primary, #070B12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        overflow: 'hidden',
        ...style,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        width: '100%',
        minHeight: '240px',
        ...style,
      };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className={`axf-page-loader ${className}`}
      style={containerStyle}
      {...props}
    >
      {/* Background ambient glow aura */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--glow-primary, rgba(11, 135, 254, 0.25)) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          animation: 'pulse-subtle 2.5s ease-in-out infinite',
        }}
      />

      {/* Central Glassmorphic Loader Card */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '28px 36px',
          borderRadius: 'var(--radius-xl, 16px)',
          backgroundColor: 'var(--surface-glass, rgba(13, 20, 32, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border, #1C2A3A)',
          boxShadow: 'var(--card-shadow, 0 10px 30px -5px rgba(0, 0, 0, 0.4))',
        }}
      >
        {/* Animated Brand Logo Mark */}
        {showLogo && (
          <div
            style={{
              animation: 'float-slow 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 12px var(--glow-primary, rgba(11, 135, 254, 0.4)))',
            }}
          >
            <Logo size={logoSize} showWordmark={true} />
          </div>
        )}

        {/* High-Tech Glowing Laser Progress Bar */}
        <div
          style={{
            position: 'relative',
            width: trackWidth,
            height: '3px',
            backgroundColor: 'var(--border-subtle, #142232)',
            borderRadius: '9999px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '50%',
              background: 'linear-gradient(90deg, transparent, var(--axf-blue, #0B87FE), var(--axf-cyan, #19D7FE), transparent)',
              borderRadius: '9999px',
              animation: 'axf-loader-slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              boxShadow: '0 0 8px var(--axf-cyan, #19D7FE)',
            }}
          />
        </div>

        {/* Message label */}
        {message && (
          <span
            style={{
              fontFamily: 'inherit',
              fontSize,
              fontWeight: 500,
              color: 'var(--text-secondary, #AAB5C4)',
              letterSpacing: '-0.01em',
            }}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
