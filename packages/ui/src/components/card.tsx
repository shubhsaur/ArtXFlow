import React from 'react';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, style, className = '', ...props }: CardProps) {
  return (
    <div
      className={`axf-card ${className}`}
      style={{
        backgroundColor: 'var(--surface, #0D1420)',
        border: '1px solid var(--border, #1C2A3A)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '24px',
        color: 'var(--text-primary, #F5F7FA)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
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
