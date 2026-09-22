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
            background: 'var(--btn-primary-bg, linear-gradient(180deg, #1E66F5 0%, #1551D1 100%))',
            color: 'var(--btn-primary-text, #FFFFFF)',
            border: '1px solid var(--btn-primary-border, rgba(255, 255, 255, 0.2))',
            boxShadow: 'var(--btn-primary-shadow, 0 2px 10px rgba(30, 102, 245, 0.35))',
            fontWeight: 600,
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            color: 'var(--text-primary, #F5F7FA)',
            border: '1px solid var(--border, #1C2A3A)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 6px 0 rgba(0, 0, 0, 0.08)',
          };
        case 'outline':
          return {
            backgroundColor: 'var(--surface-glass, rgba(255, 255, 255, 0.03))',
            color: 'var(--text-primary, #F5F7FA)',
            border: '1px solid var(--border, #1C2A3A)',
            backdropFilter: 'blur(8px)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--text-secondary, #AAB5C4)',
            border: '1px solid transparent',
          };
        case 'danger':
          return {
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
          };
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      switch (size) {
        case 'sm':
          return {
            padding: '6px 14px',
            fontSize: '13px',
            borderRadius: 'var(--radius-sm, 6px)',
          };
        case 'lg':
          return {
            padding: '12px 28px',
            fontSize: '16px',
            borderRadius: 'var(--radius-lg, 10px)',
          };
        case 'md':
        default:
          return {
            padding: '9px 18px',
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
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: 'inherit',
      outline: 'none',
      userSelect: 'none',
      ...getSizeStyles(),
      ...getVariantStyles(),
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`axf-button axf-button-${variant} axf-button-${size} ${className}`}
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
