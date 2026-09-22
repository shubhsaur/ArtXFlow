'use client';

import React from 'react';

type PlatformIconId = 'devto' | 'medium' | 'hashnode' | 'artxflow';

interface PlatformIconProps {
  id: PlatformIconId;
  size?: number;
  color?: string;
}

export function PlatformIcon({ id, size = 20, color = 'currentColor' }: PlatformIconProps) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    style: { flexShrink: 0 },
  };

  switch (id) {
    case 'devto':
      return (
        <svg {...svgProps}>
          <path
            d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6.1v4.36h.48c.36 0 .64-.07.82-.22.2-.16.3-.46.3-.9v-2.12c0-.44-.1-.73-.28-.89Z"
            fill={color}
          />
          <path
            d="M2 4v16h20V4H2Zm5.68 10.37c-.44.41-1.06.62-1.86.62H4.68V9.1h1.16c.78 0 1.39.2 1.82.59.45.41.68 1.02.68 1.83v1.96c0 .84-.22 1.48-.66 1.89Zm4.88.63h-1.06l-1.3-2.42v2.42H9.18V9.1h1.06l1.3 2.44V9.1h1.02v5.9Zm5.44-3.82h-2.08v1.18h1.52v1.08h-1.52v1.56h2.08v1.08h-3.2V9.1h3.2v1.08Z"
            fill={color}
          />
        </svg>
      );

    case 'medium':
      return (
        <svg {...svgProps}>
          <path
            d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12Z"
            fill={color}
          />
          <path
            d="M20.96 12c0 3.57-1.36 6.46-3.04 6.46S14.88 15.57 14.88 12s1.36-6.46 3.04-6.46S20.96 8.43 20.96 12Z"
            fill={color}
          />
          <path
            d="M24 12c0 3.2-.63 5.8-1.4 5.8S21.2 15.2 21.2 12s.63-5.8 1.4-5.8S24 8.8 24 12Z"
            fill={color}
          />
        </svg>
      );

    case 'hashnode':
      return (
        <svg {...svgProps}>
          <path
            d="M22.351 8.028l-6.35-6.35a2.998 2.998 0 0 0-4.242 0l-8.1 8.1a2.998 2.998 0 0 0 0 4.242l6.35 6.35a2.998 2.998 0 0 0 4.242 0l8.1-8.1a2.998 2.998 0 0 0 0-4.242Zm-8.485 11.314a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
            fill={color}
          />
        </svg>
      );

    case 'artxflow':
      return (
        <span
          style={{
            fontWeight: 800,
            fontSize: `${size * 0.6}px`,
            color,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          AXF
        </span>
      );
  }
}
