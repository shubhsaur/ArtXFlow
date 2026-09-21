'use client';

import React from 'react';

interface MatrixRow {
  capability: string;
  artxflow: string;
  schedulers: string;
  schedulersStatus: 'error' | 'warning' | 'muted';
  manual: string;
  manualStatus: 'error' | 'warning' | 'muted';
}

export function LandingCompetitiveMatrix() {
  const rows: MatrixRow[] = [
    {
      capability: 'Canonical SEO rel=tag Protection',
      artxflow: '✓ Automated & Strictly Enforced',
      schedulers: '✗ None / Unsupported',
      schedulersStatus: 'error',
      manual: '⚠ Highly Error-Prone (Manual)',
      manualStatus: 'warning',
    },
    {
      capability: 'AST Markdown & Code Syntax Parsing',
      artxflow: '✓ Full AST + Prism/Shiki Tokenizer',
      schedulers: '✗ Strips Code Blocks & Indents',
      schedulersStatus: 'error',
      manual: '⚠ Tedious Re-Highlighting',
      manualStatus: 'warning',
    },
    {
      capability: 'Developer Platform Adapters (DEV, Hashnode, Medium)',
      artxflow: '✓ Native API + Session Extensions',
      schedulers: '✗ Only Twitter/LinkedIn',
      schedulersStatus: 'error',
      manual: '~45 mins per article',
      manualStatus: 'muted',
    },
    {
      capability: 'Immutable Version Snapshots & Audit History',
      artxflow: '✓ Full ArticleVersion history per publish',
      schedulers: '✗ Overwrites In-Place / No History',
      schedulersStatus: 'error',
      manual: '✗ No Version Control',
      manualStatus: 'error',
    },
    {
      capability: 'Self-Hostable & 100% Open Source',
      artxflow: '✓ 100% MIT Licensed Monorepo',
      schedulers: '✗ Closed Proprietary SaaS ($99/mo)',
      schedulersStatus: 'error',
      manual: 'N/A',
      manualStatus: 'muted',
    },
    {
      capability: 'Unified Cross-Network Metrics',
      artxflow: '✓ Normalized Read/View Pipeline',
      schedulers: '⚠ Fragmented Social Impressions',
      schedulersStatus: 'warning',
      manual: 'Manual Spreadsheets',
      manualStatus: 'muted',
    },
  ];

  const getStatusColor = (status: 'error' | 'warning' | 'muted') => {
    switch (status) {
      case 'error':
        return 'var(--status-error, #D92D20)';
      case 'warning':
        return 'var(--secondary, #F59E0B)';
      case 'muted':
        return 'var(--text-muted, #66768D)';
    }
  };

  return (
    <section
      id="compare"
      style={{
        padding: '80px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 56px auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--primary, #0B62F5)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Competitive Matrix
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 16px 0',
              lineHeight: 1.2,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Why ArtXFlow is Built Different
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Traditional social media schedulers treat tech articles like tweets. ArtXFlow is purpose-built for engineering documentation, MDX, and search attribution.
          </p>
        </div>

        {/* Matrix Table */}
        <div
          style={{
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: '760px',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-subtle, #172333)',
                  backgroundColor: 'var(--surface-base, #070B12)',
                  fontSize: '11px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                <th style={{ padding: '16px 20px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Engineering Capability
                </th>
                <th
                  style={{
                    padding: '16px 20px',
                    fontWeight: 600,
                    color: 'var(--flow-cyan, #19D7FE)',
                    backgroundColor: 'rgba(11, 98, 245, 0.12)',
                    borderLeft: '1px solid rgba(11, 98, 245, 0.3)',
                    borderRight: '1px solid rgba(11, 98, 245, 0.3)',
                  }}
                >
                  ArtXFlow (Open Engine)
                </th>
                <th style={{ padding: '16px 20px', fontWeight: 500 }}>
                  Traditional Schedulers (Buffer, Hootsuite)
                </th>
                <th style={{ padding: '16px 20px', fontWeight: 500 }}>
                  Manual Cross-Posting
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" }}>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle, #172333)',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td
                    style={{
                      padding: '16px 20px',
                      fontFamily: "'Geist', sans-serif",
                      fontWeight: 500,
                      color: 'var(--text-primary, #F5F7FA)',
                    }}
                  >
                    {row.capability}
                  </td>
                  <td
                    style={{
                      padding: '16px 20px',
                      backgroundColor: 'rgba(11, 98, 245, 0.05)',
                      borderLeft: '1px solid rgba(11, 98, 245, 0.3)',
                      borderRight: '1px solid rgba(11, 98, 245, 0.3)',
                      color: 'var(--status-success, #12B76A)',
                      fontWeight: 600,
                    }}
                  >
                    {row.artxflow}
                  </td>
                  <td
                    style={{
                      padding: '16px 20px',
                      color: getStatusColor(row.schedulersStatus),
                    }}
                  >
                    {row.schedulers}
                  </td>
                  <td
                    style={{
                      padding: '16px 20px',
                      color: getStatusColor(row.manualStatus),
                    }}
                  >
                    {row.manual}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
