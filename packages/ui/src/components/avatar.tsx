'use client';

import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return (parts[0]?.substring(0, 2) || '?').toUpperCase();
  }
  return ((parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')).toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  style,
  className = '',
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const getDimension = () => {
    switch (size) {
      case 'sm':
        return 28;
      case 'lg':
        return 44;
      case 'md':
      default:
        return 36;
    }
  };

  const dim = getDimension();
  const initials = getInitials(name || alt);

  return (
    <div
      className={`axf-avatar ${className}`}
      role="img"
      aria-label={alt || name || 'User avatar'}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        border: '1px solid var(--border, #1C2A3A)',
        color: 'var(--text-primary, #F5F7FA)',
        fontSize: size === 'sm' ? '11px' : size === 'lg' ? '16px' : '13px',
        fontWeight: 600,
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          onError={() => setImageError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
