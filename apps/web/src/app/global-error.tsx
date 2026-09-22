'use client';

import React, { useEffect } from 'react';

/**
 * Root-level error boundary. Replaces the root layout when it fails,
 * so it must render its own <html> and <body> tags and cannot rely on
 * global CSS or shared UI components being available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#070B12',
          color: '#F5F7FA',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '480px' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #22D3EE 0%, #818CF8 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            500
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            Something Went Wrong
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: '#AAB5C4',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            A critical error occurred. Please try again.
            {error.digest ? (
              <>
                <br />
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Reference: {error.digest}</span>
              </>
            ) : null}
          </p>

          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#070B12',
              background: 'linear-gradient(135deg, #22D3EE 0%, #818CF8 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
