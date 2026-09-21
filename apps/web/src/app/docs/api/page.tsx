import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'ArtXFlow API Docs',
  description: 'Use your ArtXFlow API key to fetch articles, publications, and profile data.',
};

export default function ApiDocsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-base, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>ArtXFlow API</h1>
          <p style={{ fontSize: '16px', color: 'var(--text-muted, #66768D)', marginTop: '8px' }}>
            Use a private API key to read your articles, publication links, and profile from external clients.
          </p>
        </div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Authentication</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
            All API requests must include an <code>Authorization</code> header with your API key.
          </p>
          <pre
            style={{
              backgroundColor: 'var(--surface-container, #1C2027)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '8px',
              padding: '16px',
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}
          >
            Authorization: Bearer &lt;your_api_key&gt;
          </pre>
          <p style={{ fontSize: '14px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
            Generate and manage keys from the <Link href="/profile">Profile</Link> page.
          </p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Base URL</h2>
          <pre
            style={{
              backgroundColor: 'var(--surface-container, #1C2027)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '8px',
              padding: '16px',
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}
          >
            https://&lt;your-domain&gt;/api/v1
          </pre>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Endpoints</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Endpoint
              method="GET"
              path="https://&lt;your-domain&gt;/api/v1/articles"
              scope="articles:read"
              description="List all articles."
            />
            <Endpoint
              method="GET"
              path="https://&lt;your-domain&gt;/api/v1/articles/:articleId"
              scope="articles:read + articles:read:versions"
              description="Get a single article, including content when the versions scope is granted."
            />
            <Endpoint
              method="GET"
              path="https://&lt;your-domain&gt;/api/v1/articles/:articleId/publications"
              scope="articles:read:publications"
              description="Get platform publication URLs for an article (DEV.to, Medium, Hashnode)."
            />
            <Endpoint
              method="GET"
              path="https://&lt;your-domain&gt;/api/v1/profile"
              scope="profile:read"
              description="Read the author profile."
            />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Example</h2>
          <pre
            style={{
              backgroundColor: 'var(--surface-container, #1C2027)',
              border: '1px solid var(--border-default, #243447)',
              borderRadius: '8px',
              padding: '16px',
              overflowX: 'auto',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '13px',
            }}
          >
            {`fetch('https://artxflow.dev/api/v1/articles', {
  headers: {
    Authorization: 'Bearer axf_...',
  },
})
  .then((res) => res.json())
  .then((data) => console.log(data));`}
          </pre>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Rate Limits</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
            100 requests per minute per API key.
          </p>
        </section>
      </div>
    </main>
  );
}

function Endpoint({
  method,
  path,
  scope,
  description,
}: {
  method: string;
  path: string;
  scope: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'var(--surface-container, #1C2027)',
        border: '1px solid var(--border-default, #243447)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'var(--primary, #0B62F5)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {method}
        </span>
        <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'var(--flow-cyan, #19D7FE)' }}>
          {path}
        </code>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
        {description}
      </p>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
        Scope: <code style={{ fontFamily: "'JetBrains Mono', monospace" }}>{scope}</code>
      </p>
    </div>
  );
}
