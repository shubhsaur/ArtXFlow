'use client';

import React from 'react';

export function LandingPipelineBar() {
  const stages = [
    {
      step: '01. SOURCE',
      title: 'Author',
      desc: 'Markdown + Frontmatter validated via Zod schema.',
      icon: '✎',
      color: 'var(--status-info, #0B62F5)',
    },
    {
      step: '02. PARSE',
      title: 'AST Transform',
      desc: 'Isolated adapters transpile codeblocks & image CDNs.',
      icon: '⌥',
      color: 'var(--flow-cyan, #19D7FE)',
    },
    {
      step: '03. DISPATCH',
      title: 'Distribute',
      desc: 'Multi-threaded API fan-out with canonical headers.',
      icon: '🚀',
      color: 'var(--primary, #0B62F5)',
    },
    {
      step: '04. CONCURRENCY',
      title: 'Synchronize',
      desc: 'Handle rate-limits with token queues & retry tokens.',
      icon: '⚙',
      color: 'var(--secondary, #F59E0B)',
    },
    {
      step: '05. TELEMETRY',
      title: 'Analyze',
      desc: 'Per-destination publication status, history, and canonical verification.',
      icon: '📊',
      color: 'var(--status-success, #12B76A)',
    },
  ];

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 40px)',
        marginTop: '-30px',
        marginBottom: '64px',
      }}
    >
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--border-default, #243447)',
          backgroundColor: 'var(--surface-raised, #0D1420)',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                margin: '0 0 4px 0',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              Deterministic 5-Stage Distribution Pipeline
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
              Inngest-orchestrated background event DAG with automatic retry policies
            </p>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--status-info, #0B62F5)',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'rgba(11, 98, 245, 0.1)',
              border: '1px solid rgba(11, 98, 245, 0.25)',
              fontWeight: 500,
            }}
          >
            Orchestrated Background Execution
          </span>
        </div>

        {/* 5 Nodes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {stages.map((stage) => (
            <div
              key={stage.step}
              style={{
                padding: '14px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-subtle, #172333)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: stage.color,
                  }}
                >
                  {stage.step}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)' }}>{stage.icon}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                {stage.title}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', lineHeight: 1.5 }}>
                {stage.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
