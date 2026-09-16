import { NextResponse } from 'next/server';
import { PublicSiteService } from '@artxflow/content-core';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subdomain: string }> },
) {
  const { subdomain } = await params;
  const publicSiteService = new PublicSiteService();
  const result = await publicSiteService.listPublicArticles(subdomain);

  if (!result) {
    return new NextResponse('Site Not Found', { status: 404 });
  }

  const { site, articles } = result;
  const siteUrl = `https://${site.subdomain}.artxflow.com`;

  const articleEntries = articles
    .map((article) => {
      const lastMod = new Date(article.updatedAt || article.createdAt).toISOString().split('T')[0];
      return `
  <url>
    <loc>${siteUrl}/${article.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${articleEntries}
</urlset>`;

  return new NextResponse(sitemapXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
