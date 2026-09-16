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

  const rssItems = articles
    .map((article) => {
      const pubDate = new Date(article.createdAt).toUTCString();
      const articleUrl = `${siteUrl}/${article.slug}`;

      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.excerpt || ''}]]></description>
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title><![CDATA[${site.name}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[Latest publications from ${site.name}]]></description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
