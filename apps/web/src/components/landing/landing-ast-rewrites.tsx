'use client';

import React from 'react';

export function LandingAstRewrites() {
  const platforms = [
    { name: 'DEV Community REST API', icon: 'code' },
    { name: 'Hashnode GraphQL API', icon: 'api' },
    { name: 'Medium Publishing API', icon: 'link' },
    { name: 'Hosted Next.js Publication Sites', icon: 'web' },
  ];

  return (
    <section
      id="adapters"
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
        {/* Left: Code Editor Window */}
        <div
          style={{
            backgroundColor: 'var(--surface-raised, #0D1420)',
            border: '1px solid var(--border-default, #243447)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Editor Titlebar */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-base, #070B12)',
              borderBottom: '1px solid var(--border-subtle, #172333)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--flow-cyan, #19D7FE)',
                }}
              />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'var(--flow-cyan, #19D7FE)',
                  fontWeight: 500,
                }}
              >
                AST Transformer: /adapters/hashnode.ts
              </span>
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: 'var(--status-success, #12B76A)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-success, #12B76A)',
                }}
              />
              Type-Safe AST v2.0
            </span>
          </div>

          {/* Code Body */}
          <pre
            style={{
              padding: '20px',
              margin: 0,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              lineHeight: 1.65,
              backgroundColor: '#0a0e15',
              color: 'var(--text-secondary, #AAB5C4)',
              overflowX: 'auto',
            }}
          >
            <code>
              <span style={{ color: 'var(--text-muted, #66768D)' }}>// Platform-specific AST transformation engine</span>{'\n'}
              <span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>export class </span>
              <span style={{ color: 'var(--flow-cyan, #19D7FE)', fontWeight: 600 }}>HashnodeAdapter </span>
              <span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>implements </span>
              <span style={{ color: 'var(--text-primary, #F5F7FA)' }}>PublishingPlatform </span>
              {'{'}{'\n'}
              {'  '}<span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>async </span>
              <span style={{ color: 'var(--secondary, #F59E0B)' }}>transform</span>
              (article: <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Article</span>): <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>Promise</span>&lt;PlatformPayload&gt; {'{'}{'\n'}
              {'    '}<span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>const </span>
              ast = <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>unified</span>(){'\n'}
              {'      '}.use(remarkParse){'\n'}
              {'      '}.use(remarkGfm){'\n'}
              {'      '}.use(transformCodeBlocksToGistOrHighlight){'\n'}
              {'      '}.use(resolveLocalCdnImages, {'{ cdn: '}<span style={{ color: 'var(--status-success, #12B76A)' }}>&apos;https://cdn.artxflow.dev&apos;</span>{' }'}{'\n'}
              {'      '}.use(remarkStringify);{'\n\n'}
              {'    '}<span style={{ color: 'var(--primary, #0B62F5)', fontWeight: 600 }}>return </span>{'{'}{'\n'}
              {'      '}publicationId: env.HASHNODE_PUB_ID,{'\n'}
              {'      '}input: {'{'}{'\n'}
              {'        '}title: article.title,{'\n'}
              {'        '}contentMarkdown: <span style={{ color: 'var(--flow-cyan, #19D7FE)' }}>String</span>(<span style={{ color: 'var(--primary, #0B62F5)' }}>await </span>ast.process(article.content)),{'\n'}
              {'        '}canonicalUrl: article.canonicalUrl, <span style={{ color: 'var(--text-muted, #66768D)' }}>// Strict SEO</span>{'\n'}
              {'        '}tags: article.tags.map(t =&gt; ({'{ slug: t.slug, name: t.name }'})){'\n'}
              {'      '}{'}'}{'\n'}
              {'    '}{'};'}{'\n'}
              {'  '}{'}'}{'\n'}
              {'}'}
            </code>
          </pre>
        </div>

        {/* Right: Copy & Platform Pills */}
        <div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--flow-cyan, #19D7FE)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid rgba(25, 215, 254, 0.3)',
              marginBottom: '16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schema</span>
            MODULAR EXTENSIBILITY
          </span>

          <h3
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
            Isolated Platform Adapters &amp; Smart AST Rewrites
          </h3>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.65,
              marginBottom: '24px',
            }}
          >
            No messy string replaces. ArtXFlow parses markdown into a concrete syntax tree (MDAST). Adapters compile code blocks, image attributes, and frontmatter into exact target schemas without altering the core markdown source.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {platforms.map((plat) => (
              <div
                key={plat.name}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-raised, #0D1420)',
                  border: '1px solid var(--border-default, #243447)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--flow-cyan, #19D7FE)' }}>
                  {plat.icon}
                </span>
                <span>{plat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
