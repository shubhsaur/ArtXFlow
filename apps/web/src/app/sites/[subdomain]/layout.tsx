import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicSiteService } from '@artxflow/content-core';

export const dynamic = 'force-dynamic';

interface SiteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { subdomain } = await params;
  const publicSiteService = new PublicSiteService();
  const site = await publicSiteService.resolvePublicSite(subdomain);

  if (!site) {
    notFound();
  }

  const theme = site.themeConfig || {};
  const primaryColor = theme.primaryColor || 'var(--axf-blue, #0B87FE)';

  return (
    <div
      className="axf-public-site-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--background, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        fontFamily: "var(--font-sans, 'Geist', -apple-system, sans-serif)",
      }}
    >
      {/* Site Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle, #142232)',
          backgroundColor: 'var(--surface, #0D1420)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Link
            href={`/sites/${subdomain}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.logoUrl || '/logo.png'}
              alt={site.name}
              style={{ height: '28px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }}
            />
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              {site.name}
            </span>
          </Link>

          {/* Navigation Links */}
          {theme.headerNavigation && theme.headerNavigation.length > 0 && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {theme.headerNavigation.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1040px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px',
        }}
      >
        {children}
      </main>

      {/* Site Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle, #142232)',
          padding: '28px 24px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-tertiary, #718096)',
        }}
      >
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          {theme.footerText ? (
            <p style={{ margin: '0 0 8px 0' }}>{theme.footerText}</p>
          ) : (
            <p style={{ margin: '0 0 8px 0' }}>
              Published with <span style={{ color: primaryColor, fontWeight: 600 }}>ArtXFlow</span>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
