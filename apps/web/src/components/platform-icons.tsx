'use client';

import React from 'react';

type PlatformIconId = 'devto' | 'medium' | 'hashnode' | 'artxflow';

interface PlatformIconProps {
  id: PlatformIconId;
  size?: number;
  color?: string;
}

const ICON_SRC: Record<Exclude<PlatformIconId, 'artxflow'>, string> = {
  devto: '/dev-to-icon.png',
  medium: '/medium-logo-icon.webp',
  hashnode: '/hashnode-icon.png',
};

export function PlatformIcon({ id, size = 32, color }: PlatformIconProps) {
  if (id === 'artxflow') {
    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '8px',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          border: '1px solid var(--border, #1C2A3A)',
          flexShrink: 0,
          fontWeight: 800,
          fontSize: `${size * 0.35}px`,
          color: color ?? 'currentColor',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        AXF
      </span>
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        border: '1px solid var(--border, #1C2A3A)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ICON_SRC[id]}
        alt={`${id} logo`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
