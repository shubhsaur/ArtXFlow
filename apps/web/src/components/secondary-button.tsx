'use client';

import React, { useState } from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryButton({ children, style, disabled, ...rest }: SecondaryButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: isHovered && !disabled
      ? 'var(--surface-container, #1C2027)'
      : 'var(--surface-base, #070B12)',
    border: '1px solid var(--border-default, #243447)',
    color: isHovered && !disabled
      ? 'var(--text-primary, #F5F7FA)'
      : 'var(--text-secondary, #AAB5C4)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    ...style,
  };

  return (
    <button
      type="button"
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      {children}
    </button>
  );
}
