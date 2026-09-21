'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@artxflow/ui';

export function AuthMobileHeader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
      {/* Top Mobile Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border-subtle, #172333)',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size={28} showWordmark={true} />
        </Link>
        <Link
          href="/#docs"
          style={{
            fontSize: '12px',
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-secondary, #AAB5C4)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>Docs</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            arrow_forward
          </span>
        </Link>
      </div>

      {/* Hero Text */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: "'Geist', sans-serif",
            letterSpacing: '-0.025em',
            color: 'var(--text-primary, #F5F7FA)',
            lineHeight: 1.2,
            margin: '0 0 8px 0',
          }}
        >
          Write once.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #19D7FE 0%, #0B62F5 50%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Flow everywhere.
          </span>
        </h1>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary, #AAB5C4)',
            lineHeight: 1.5,
            margin: 0,
            maxWidth: '340px',
          }}
        >
          The open-source multi-destination distribution engine for engineering blogs &amp; technical publications.
        </p>
      </div>

      {/* Compact Live Pipeline Card */}
      <div
        style={{
          borderRadius: '10px',
          backgroundColor: 'var(--surface-base, #070B12)',
          border: '1px solid var(--border-subtle, #172333)',
          padding: '14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid var(--border-subtle, #172333)',
            marginBottom: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--flow-cyan, #19D7FE)' }}>
              alt_route
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              Canonical Dispatch Pipeline
            </span>
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: 'var(--status-success, #12B76A)',
              backgroundColor: 'rgba(18, 183, 106, 0.12)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            Active
          </span>
        </div>

        {/* 2x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', fontFamily: "'JetBrains Mono', monospace" }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>DEV.to</span>
            <span style={{ color: 'var(--status-success, #12B76A)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
              Synced
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>Hashnode GQL</span>
            <span style={{ color: 'var(--status-success, #12B76A)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--status-success, #12B76A)' }} />
              Synced
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>Medium v1</span>
            <span style={{ color: 'var(--flow-cyan, #19D7FE)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--flow-cyan, #19D7FE)' }} />
              Can. OK
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-subtle, #172333)',
            }}
          >
            <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>Public Blog</span>
            <span style={{ color: 'var(--flow-cyan, #19D7FE)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--flow-cyan, #19D7FE)' }} />
              Origin
            </span>
          </div>
        </div>

        {/* Micro Terminal Prompt */}
        <div
          style={{
            marginTop: '8px',
            padding: '6px 8px',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            borderRadius: '4px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'var(--text-secondary, #AAB5C4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>$ artxflow dispatch --all-targets</span>
          <span style={{ color: 'var(--status-success, #12B76A)' }}>(0 errors)</span>
        </div>
      </div>
    </div>
  );
}
