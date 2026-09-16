import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PublicSiteService } from '@artxflow/content-core';
import { ArticleRenderer } from '@artxflow/ui';

export const dynamic = 'force-dynamic';

interface PublicArticlePageProps {
  params: Promise<{ subdomain: string; slug: string }>;
}

export async function generateMetadata({ params }: PublicArticlePageProps): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const publicSiteService = new PublicSiteService();
  const result = await publicSiteService.getPublicArticle(subdomain, slug);

  if (!result) {
    return {
      title: 'Article Not Found — ArtXFlow',
    };
  }

  const { site, article } = result;
  const description = article.excerpt || article.title;
  const publishedTime = new Date(article.createdAt).toISOString();
  const canonicalUrl = `/sites/${subdomain}/${slug}`;

  return {
    title: `${article.title} — ${site.name}`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      publishedTime,
      siteName: site.name,
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
    },
  };
}

export default async function PublicArticlePage({ params }: PublicArticlePageProps) {
  const { subdomain, slug } = await params;
  const publicSiteService = new PublicSiteService();
  const result = await publicSiteService.getPublicArticle(subdomain, slug);

  // If article not found, or in DRAFT status, or belongs to another org -> 404
  if (!result) {
    notFound();
  }

  const { site, article, version } = result;
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const words = (version.content || '').trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <article style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href={`/sites/${subdomain}`}
          style={{
            fontSize: '13px',
            color: 'var(--axf-cyan, #19D7FE)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
          }}
        >
          ← Back to {site.name}
        </Link>
      </div>

      {/* Article Header */}
      <header
        style={{
          marginBottom: '36px',
          paddingBottom: '24px',
          borderBottom: '1px solid var(--border-subtle, #142232)',
        }}
      >
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary, #F5F7FA)',
            margin: '0 0 16px 0',
          }}
        >
          {article.title}
        </h1>

        {article.excerpt && (
          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.55,
              color: 'var(--text-secondary, #AAB5C4)',
              margin: '0 0 20px 0',
            }}
          >
            {article.excerpt}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--text-tertiary, #718096)',
          }}
        >
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>
      </header>

      {/* Canonical Content Renderer */}
      <div className="axf-public-article-content">
        <ArticleRenderer content={version.content} />
      </div>
    </article>
  );
}
