'use client';

import React from 'react';
import Image from 'next/image';

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

export function PlatformIcon({ id, size = 20, color }: PlatformIconProps) {
  if (id === 'artxflow') {
    return (
      <span
        style={{
          fontWeight: 800,
          fontSize: `${size * 0.6}px`,
          color: color ?? 'currentColor',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}
      >
        AXF
      </span>
    );
  }

  return (
    <Image
      src={ICON_SRC[id]}
      alt={`${id} logo`}
      width={size}
      height={size}
      style={{ flexShrink: 0, objectFit: 'contain' }}
    />
  );
}
