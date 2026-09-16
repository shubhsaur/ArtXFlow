import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      style,
      className = '',
      ...props
    },
    ref,
  ) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            background: 'var(--axf-gradient, linear-gradient(135deg, #0B87FE 0%, #7A5CFD 100%))',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: '0 2px 8px rgba(11, 135, 254, 0.3)',
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            color: 'var(--text-primary, #F5F7FA)',
            border: '1px solid var(--border, #1C2A3A)',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: 'var(--text-primary, #F5F7FA)',
            border: '1px solid var(--border, #1C2A3A)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--text-secondary, #AAB5C4)',
            border: 'none',
          };
        case 'danger':
          return {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: 'none',
          };
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      switch (size) {
        case 'sm':
          return {
            padding: '6px 12px',
            fontSize: '13px',
            borderRadius: 'var(--radius-sm, 6px)',
          };
        case 'lg':
          return {
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: 'var(--radius-lg, 10px)',
          };
        case 'md':
        default:
          return {
            padding: '8px 16px',
            fontSize: '14px',
            borderRadius: 'var(--radius-md, 8px)',
          };
      }
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontWeight: 500,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: 'all 0.15s ease-in-out',
      fontFamily: 'inherit',
      outline: 'none',
      ...getSizeStyles(),
      ...getVariantStyles(),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`axf-button ${className}`}
        style={baseStyles}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '14px',
              height: '14px',
              border: '2px solid currentColor',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
            }}
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
