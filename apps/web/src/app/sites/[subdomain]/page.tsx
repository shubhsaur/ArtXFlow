import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicSiteService } from '@artxflow/content-core';
import { Card, Badge } from '@artxflow/ui';

export const dynamic = 'force-dynamic';

interface SitePageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: SitePageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const publicSiteService = new PublicSiteService();
  const site = await publicSiteService.resolvePublicSite(subdomain);

  if (!site) {
    return {
      title: 'Site Not Found — ArtXFlow',
    };
  }

  const description =
    site.themeConfig.footerText || `Published articles and updates from ${site.name}.`;

  return {
    title: `${site.name} — Blog`,
    description,
    openGraph: {
      title: `${site.name} — Blog`,
      description,
      type: 'website',
    },
  };
}

export default async function SiteHomePage({ params }: SitePageProps) {
  const { subdomain } = await params;
  const publicSiteService = new PublicSiteService();
  const result = await publicSiteService.listPublicArticles(subdomain);

  if (!result) {
    notFound();
  }

  const { site, articles } = result;

  return (
    <div>
      {/* Blog Intro Hero */}
      <section
        style={{
          marginBottom: '40px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle, #142232)',
        }}
      >
        <h1
          style={{
            fontSize: '34px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary, #F5F7FA)',
            margin: '0 0 12px 0',
          }}
        >
          {site.name}
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary, #AAB5C4)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Latest canonical articles and technical publications.
        </p>
      </section>

      {/* Articles Listing */}
      {articles.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary, #F5F7FA)',
              margin: '0 0 8px 0',
            }}
          >
            No articles published yet
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
            Check back soon for new technical articles from {site.name}.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {articles.map((article) => {
            const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <Link
                key={article.id}
                href={`/sites/${subdomain}/${article.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card
                  className="axf-article-card-hover"
                  style={{
                    padding: '24px',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <Badge variant="info">PUBLISHED</Badge>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary, #718096)' }}>
                      {formattedDate}
                    </span>
                  </div>
                  <h2
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--text-primary, #F5F7FA)',
                      margin: '0 0 10px 0',
                      lineHeight: 1.3,
                    }}
                  >
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p
                      style={{
                        fontSize: '15px',
                        color: 'var(--text-secondary, #AAB5C4)',
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {article.excerpt}
                    </p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
