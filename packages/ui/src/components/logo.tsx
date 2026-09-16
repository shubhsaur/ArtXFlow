import React from 'react';

export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ size = 28, showWordmark = true, className = '', ...props }: LogoProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
      className={className}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
      >
        <defs>
          <linearGradient id="axf-flow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B87FE" />
            <stop offset="45%" stopColor="#19D7FE" />
            <stop offset="100%" stopColor="#7A5CFD" />
          </linearGradient>
        </defs>

        {/* AXF flowing abstract distribution mark */}
        <circle cx="20" cy="20" r="18" fill="#0D1420" stroke="#1C2A3A" strokeWidth="1.5" />
        <path
          d="M12 28L18 16L24 28"
          stroke="url(#axf-flow-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15 24H21" stroke="url(#axf-flow-grad)" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 14L28 26" stroke="#19D7FE" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 14L22 26" stroke="#7A5CFD" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: 'inherit',
            fontWeight: 700,
            fontSize: '18px',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary, #F5F7FA)',
          }}
        >
          Art<span style={{ color: 'var(--axf-cyan, #19D7FE)' }}>X</span>Flow
        </span>
      )}
    </div>
  );
}
