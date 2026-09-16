import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../../middleware';
import { generateMetadata as generateSiteMetadata } from './[subdomain]/page';
import { generateMetadata as generateArticleMetadata } from './[subdomain]/[slug]/page';
import { GET as getRss } from './[subdomain]/rss.xml/route';
import { GET as getSitemap } from './[subdomain]/sitemap.xml/route';

vi.mock('@artxflow/content-core', () => {
  const mockSite = {
    id: 'site-1',
    organizationId: 'org-1',
    name: 'Acme Engineering',
    subdomain: 'acme',
    status: 'ACTIVE',
    themeConfig: {
      footerText: 'Custom Acme Footer',
    },
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockArticle = {
    id: 'article-1',
    organizationId: 'org-1',
    authorId: 'author-1',
    title: 'Distributed System Architecture',
    slug: 'distributed-system-architecture',
    excerpt: 'Deep dive into canonical content distribution.',
    status: 'READY',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
  };

  const mockVersion = {
    id: 'version-1',
    articleId: 'article-1',
    versionNumber: 1,
    content: '# Distributed System Architecture\n\nContent here.',
    contentFormat: 'markdown',
    metadata: {},
    createdBy: 'author-1',
    createdAt: new Date('2026-01-02T00:00:00Z'),
  };

  const MockService = vi.fn().mockImplementation(() => ({
    resolvePublicSite: vi.fn().mockImplementation((subdomain: string) => {
      if (subdomain === 'acme') return Promise.resolve(mockSite);
      return Promise.resolve(null);
    }),
    getPublicArticle: vi.fn().mockImplementation((subdomain: string, slug: string) => {
      if (subdomain === 'acme' && slug === 'distributed-system-architecture') {
        return Promise.resolve({
          site: mockSite,
          article: mockArticle,
          version: mockVersion,
        });
      }
      return Promise.resolve(null);
    }),
    listPublicArticles: vi.fn().mockImplementation((subdomain: string) => {
      if (subdomain === 'acme') {
        return Promise.resolve({
          site: mockSite,
          articles: [mockArticle],
        });
      }
      return Promise.resolve(null);
    }),
  }));

  return { PublicSiteService: MockService };
});

describe('Public Blog & Subdomain Routing', () => {
  describe('Middleware Subdomain Resolution', () => {
    it('rewrites <subdomain>.artxflow.com to /sites/<subdomain>/...', () => {
      const req = new NextRequest('https://acme.artxflow.com/my-post', {
        headers: { host: 'acme.artxflow.com' },
      });

      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/sites/acme/my-post');
    });

    it('rewrites <subdomain>.localhost:3000 to /sites/<subdomain>/...', () => {
      const req = new NextRequest('http://acme.localhost:3000/', {
        headers: { host: 'acme.localhost:3000' },
      });

      const res = middleware(req);
      const rewriteUrl = res.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/sites/acme');
    });

    it('does not rewrite reserved subdomains like app or api', () => {
      const reqApp = new NextRequest('https://app.artxflow.com/dashboard', {
        headers: { host: 'app.artxflow.com' },
      });
      const resApp = middleware(reqApp);
      expect(resApp.headers.get('x-middleware-rewrite')).toBeNull();

      const reqApi = new NextRequest('https://api.artxflow.com/v1', {
        headers: { host: 'api.artxflow.com' },
      });
      const resApi = middleware(reqApi);
      expect(resApi.headers.get('x-middleware-rewrite')).toBeNull();
    });

    it('does not rewrite internal Next.js assets or direct /sites routes', () => {
      const reqNext = new NextRequest('https://acme.artxflow.com/_next/static/chunk.js', {
        headers: { host: 'acme.artxflow.com' },
      });
      expect(middleware(reqNext).headers.get('x-middleware-rewrite')).toBeNull();

      const reqSites = new NextRequest('https://acme.artxflow.com/sites/acme', {
        headers: { host: 'acme.artxflow.com' },
      });
      expect(middleware(reqSites).headers.get('x-middleware-rewrite')).toBeNull();
    });
  });

  describe('SEO Metadata Generation', () => {
    it('generates correct metadata for public site home page', async () => {
      const meta = await generateSiteMetadata({
        params: Promise.resolve({ subdomain: 'acme' }),
      });

      expect(meta.title).toBe('Acme Engineering — Blog');
      expect(meta.description).toBe('Custom Acme Footer');
      expect(meta.openGraph?.title).toBe('Acme Engineering — Blog');
    });

    it('handles non-existent site metadata safely', async () => {
      const meta = await generateSiteMetadata({
        params: Promise.resolve({ subdomain: 'unknown-subdomain' }),
      });

      expect(meta.title).toContain('Site Not Found');
    });

    it('generates full OpenGraph and canonical metadata for published article', async () => {
      const meta = await generateArticleMetadata({
        params: Promise.resolve({
          subdomain: 'acme',
          slug: 'distributed-system-architecture',
        }),
      });

      expect(meta.title).toBe('Distributed System Architecture — Acme Engineering');
      expect(meta.description).toBe('Deep dive into canonical content distribution.');
      expect(meta.alternates?.canonical).toBe('/sites/acme/distributed-system-architecture');
      expect(meta.openGraph?.title).toBe('Distributed System Architecture');
      expect((meta.twitter as { card?: string })?.card).toBe('summary_large_image');
    });

    it('returns Article Not Found metadata for drafts or non-existent slugs', async () => {
      const meta = await generateArticleMetadata({
        params: Promise.resolve({
          subdomain: 'acme',
          slug: 'draft-or-unknown-slug',
        }),
      });

      expect(meta.title).toContain('Article Not Found');
    });
  });

  describe('RSS Feed & Sitemap Routes', () => {
    it('generates valid RSS 2.0 XML for published articles', async () => {
      const req = new Request('https://acme.artxflow.com/rss.xml');
      const res = await getRss(req, { params: Promise.resolve({ subdomain: 'acme' }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('application/xml');

      const xml = await res.text();
      expect(xml).toContain('<rss version="2.0">');
      expect(xml).toContain('<title><![CDATA[Acme Engineering]]></title>');
      expect(xml).toContain('<title><![CDATA[Distributed System Architecture]]></title>');
      expect(xml).toContain('https://acme.artxflow.com/distributed-system-architecture');
    });

    it('returns 404 for RSS on non-existent site', async () => {
      const req = new Request('https://unknown.artxflow.com/rss.xml');
      const res = await getRss(req, { params: Promise.resolve({ subdomain: 'unknown' }) });

      expect(res.status).toBe(404);
    });

    it('generates valid sitemap.xml with canonical links', async () => {
      const req = new Request('https://acme.artxflow.com/sitemap.xml');
      const res = await getSitemap(req, { params: Promise.resolve({ subdomain: 'acme' }) });

      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toContain('application/xml');

      const xml = await res.text();
      expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(xml).toContain('<loc>https://acme.artxflow.com</loc>');
      expect(xml).toContain('<loc>https://acme.artxflow.com/distributed-system-architecture</loc>');
    });

    it('returns 404 for sitemap on non-existent site', async () => {
      const req = new Request('https://unknown.artxflow.com/sitemap.xml');
      const res = await getSitemap(req, { params: Promise.resolve({ subdomain: 'unknown' }) });

      expect(res.status).toBe(404);
    });
  });
});
