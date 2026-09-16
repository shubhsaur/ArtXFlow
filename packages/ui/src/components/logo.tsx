import React from 'react';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  showWordmark?: boolean;
  src?: string;
  alt?: string;
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
        width={size}
        height={size}
        style={{
          width: `${size}px`,
          height: `${size}px`,
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
          Art<span style={{ color: 'var(--axf-cyan, #19D7FE)' }}>X</span>Flow
        </span>
      )}
    </div>
  );
}
