'use client';

import React from 'react';

export interface ThemeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({
  size = 'md',
  className = '',
  style,
  ...props
}: ThemeToggleProps) {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, iconSize: 16 };
      case 'lg':
        return { width: 44, height: 44, iconSize: 22 };
      case 'md':
      default:
        return { width: 38, height: 38, iconSize: 18 };
    }
  };

  const { width, height, iconSize } = getDimensions();

  return (
    <button
      type="button"
      aria-label="Obsidian Dark theme active"
      title="Obsidian Dark theme active"
      className={`axf-theme-toggle ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: 'var(--radius-md, 8px)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        border: '1px solid var(--border, #1C2A3A)',
        color: 'var(--text-primary, #F5F7FA)',
        cursor: 'default',
        padding: 0,
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
