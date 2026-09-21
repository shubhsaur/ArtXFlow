import React from 'react';

interface ButtonSpinnerProps {
  size?: number;
  color?: string;
}

export function ButtonSpinner({ size = 14, color = 'currentColor' }: ButtonSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        border: `2px solid ${color}`,
        borderRightColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}
