import React from 'react';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  showWordmark?: boolean;
  src?: string;
  alt?: string;
}

export const BRAND_X_GRADIENT =
  'linear-gradient(135deg, #19D7FE 0%, #0B87FE 38%, #7A5CFD 72%, #E040FB 100%)';

export function BrandWordmark({
  className = '',
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={className} style={{ display: 'inline', fontWeight: 'inherit', ...style }}>
      Art
      <span
        style={{
          background: BRAND_X_GRADIENT,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          fontWeight: 'inherit',
        }}
      >
        X
      </span>
      Flow
    </span>
  );
}

export function Logo({
  size = 32,
  showWordmark = true,
  src = '/logo.png',
  alt = 'ArtXFlow Logo',
  className = '',
  style,
  ...props
}: LogoProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
      className={className}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={Math.round(size * 1.8)}
        height={size}
        style={{
          height: `${size}px`,
          width: 'auto',
          maxHeight: `${size}px`,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
      />

      {showWordmark && (
        <span
          style={{
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: `${Math.max(16, Math.round(size * 0.6))}px`,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Art
          <span
            style={{
              background: BRAND_X_GRADIENT,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              fontWeight: 800,
              padding: '0 0.5px',
            }}
          >
            X
          </span>
          Flow
        </span>
      )}
    </div>
  );
}

