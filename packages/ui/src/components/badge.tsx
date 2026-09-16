import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'outline';
}

export function Badge({
  children,
  variant = 'default',
  style,
  className = '',
  ...props
}: BadgeProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'info':
        return {
          backgroundColor: 'rgba(11, 135, 254, 0.15)',
          color: 'var(--axf-cyan, #19D7FE)',
          border: '1px solid rgba(11, 135, 254, 0.3)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary, #AAB5C4)',
          border: '1px solid var(--border, #1C2A3A)',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          color: 'var(--text-primary, #F5F7FA)',
          border: '1px solid var(--border, #1C2A3A)',
        };
    }
  };

  return (
    <span
      className={`axf-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full, 9999px)',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: 1.4,
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
