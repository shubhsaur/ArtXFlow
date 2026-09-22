import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated';
}

export function Card({
  children,
  variant = 'default',
  style,
  className = '',
  ...props
}: CardProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'var(--surface-glass, rgba(13, 20, 32, 0.8))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        };
      case 'elevated':
        return {
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.25)',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--surface, #0D1420)',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
        };
    }
  };

  return (
    <div
      className={`axf-card axf-card-${variant} ${className}`}
      style={{
        border: '1px solid var(--border, #1C2A3A)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '24px',
        color: 'var(--text-primary, #F5F7FA)',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  style,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`axf-card-header ${className}`}
      style={{
        marginBottom: '16px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  style,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`axf-card-title ${className}`}
      style={{
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-primary, #F5F7FA)',
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  style,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`axf-card-description ${className}`}
      style={{
        fontSize: '14px',
        color: 'var(--text-secondary, #AAB5C4)',
        marginTop: '4px',
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  style,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`axf-card-content ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  style,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`axf-card-footer ${className}`}
      style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle, #142232)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
