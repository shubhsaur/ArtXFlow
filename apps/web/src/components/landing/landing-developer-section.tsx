'use client';

import React from 'react';

export function LandingDeveloperSection() {
  const architecturalFeatures = [
    {
      icon: 'bolt',
      color: 'var(--primary, #0B62F5)',
      title: 'Turborepo Orchestration',
      description: 'High-velocity caching for zero-friction local development.',
    },
    {
      icon: 'database',
      color: 'var(--flow-cyan, #19D7FE)',
      title: 'PostgreSQL & Drizzle ORM',
      description: 'Deterministic schema migrations and instant serverless branching.',
    },
    {
      icon: 'cycle',
      color: 'var(--secondary, #F59E0B)',
      title: 'Inngest Background Workflows',
      description: 'Asynchronous event-driven publishing with independent step-level retries.',
    },
  ];

  return (
    <section
      id="docs"
      className="code-grid"
      style={{
        padding: '80px clamp(16px, 4vw, 40px)',
        backgroundColor: 'var(--surface-base, #070B12)',
        borderBottom: '1px solid var(--border-subtle, #172333)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        {/* Left Column: Architecture Highlights */}
        <div>
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
            Developer-First Architecture
          </span>
          <h2
            style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 16px 0',
              lineHeight: 1.2,
              fontFamily: "'Geist', sans-serif",
            }}
          >
            Built with TypeScript, Drizzle ORM &amp; Inngest
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.65,
              marginBottom: '32px',
            }}
          >
            The monorepo is engineered for modular scale. Add custom blog platforms in under 50 lines of code by implementing our standard{' '}
            <code
              style={{
                color: 'var(--primary, #0B62F5)',
                fontFamily: "'JetBrains Mono', monospace",
                backgroundColor: 'rgba(11, 98, 245, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              PublishingPlatform
            </code>{' '}
            interface.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {architecturalFeatures.map((feat) => (
              <div key={feat.title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--surface-raised, #0D1420)',
                    border: '1px solid var(--border-default, #243447)',
                    color: feat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {feat.icon}
                  </span>
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #F5F7FA)',
                      fontFamily: "'Geist', sans-serif",
                      margin: '0 0 4px 0',
                    }}
                  >
                    {feat.title}
                  </h4>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-muted, #66768D)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Terminal Simulation */}
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid var(--border-default, #243447)',
            backgroundColor: 'var(--surface-raised, #0D1420)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
        >
          {/* Titlebar */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'var(--surface-base, #070B12)',
              borderBottom: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
              <span
                style={{
                  marginLeft: '8px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                terminal: artxflow publish
              </span>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px',
                color: 'var(--text-muted, #66768D)',
              }}
            >
              zsh
            </span>
          </div>

          {/* Terminal Content */}
          <div
            style={{
              padding: '20px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              lineHeight: 1.65,
              backgroundColor: '#0a0e15',
              color: 'var(--text-secondary, #AAB5C4)',
              overflowX: 'auto',
            }}
          >
            <p style={{ color: 'var(--text-muted, #66768D)', margin: '0 0 6px 0' }}>
              # Author an article in the ArtXFlow editor
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
              <span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>$ </span>
              <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>open https://artxflow.vercel.app/articles/new</span>
            </p>

            <div
              style={{
                margin: '10px 0',
                padding: '12px 14px',
                backgroundColor: 'rgba(7, 11, 18, 0.8)',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle, #172333)',
                fontSize: '11px',
              }}
            >
              <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>---</span><br />
              <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>title:</span> &quot;Architecting Low-Latency Multi-Platform Pipelines&quot;<br />
              <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>canonical_url:</span> &quot;https://myblog.dev/blog/pipelines&quot;<br />
              <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>tags:</span> [system-design, devops]<br />
              <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>---</span>
            </div>

            <p style={{ color: 'var(--text-muted, #66768D)', margin: '16px 0 6px 0' }}>
              # Click Publish — Inngest picks up the event
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <p style={{ color: 'var(--flow-cyan, #19D7FE)', margin: 0 }}>
                ● [Inngest Worker] Fan-out event: article.published (id: evt_9941a8e)
              </p>
              <p style={{ color: 'var(--status-success, #12B76A)', margin: 0 }}>
                ✓ DEV.to: published (id: 198421, canonical: verified)
              </p>
              <p style={{ color: 'var(--status-success, #12B76A)', margin: 0 }}>
                ✓ Hashnode: published (post: 67b5e..., canonical: set)
              </p>
              <p style={{ color: 'var(--status-success, #12B76A)', margin: 0 }}>
                ✓ Medium: published (id: 4a2f8b, rel=canonical: set)
              </p>
            </div>

            <p
              style={{
                color: 'var(--flow-cyan, #19D7FE)',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: 0,
              }}
            >
              ⚡ All destinations in sync. Zero duplicate content penalty.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
