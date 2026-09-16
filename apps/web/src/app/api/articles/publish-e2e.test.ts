import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PublishArticleService,
  PublicationService,
  calculateDistributionStatus,
  MemoryJobQueue,
} from '@artxflow/publishing';
import {
  ArtXFlowBlogAdapter,
  platformAdapterRegistry,
  applyDestinationOverrides,
} from '@artxflow/platform-adapters';
import { PublicSiteService } from '@artxflow/content-core';
import type {
  Article,
  ArticleVersion,
  Site,
  Destination,
  Publication,
  ArticleRepository,
  ArticleVersionRepository,
  SiteRepository,
  DestinationRepository,
  PublicationRepository,
  PublicationEventRepository,
  OrganizationRepository,
} from '@artxflow/database';

describe('Publish Article End-to-End Slice', () => {
  const orgId = '00000000-0000-0000-0000-000000000001';
  const userId = 'user-publisher-1';
  const articleId = '00000000-0000-0000-0000-000000000002';
  const versionId = '00000000-0000-0000-0000-000000000003';
  const siteId = '00000000-0000-0000-0000-000000000004';
  const destId = '00000000-0000-0000-0000-000000000005';

  let articleStore: Map<string, Article>;
  let versionStore: Map<string, ArticleVersion>;
  let siteStore: Map<string, Site>;
  let destStore: Map<string, Destination>;
  let pubStore: Map<string, Publication>;
  let pubEvents: Array<{ publicationId: string; eventType: string; metadata?: unknown }>;

  let articleRepo: ArticleRepository;
  let versionRepo: ArticleVersionRepository;
  let siteRepo: SiteRepository;
  let destRepo: DestinationRepository;
  let pubRepo: PublicationRepository;
  let pubEventRepo: PublicationEventRepository;
  let orgRepo: OrganizationRepository;

  let jobQueue: MemoryJobQueue;
  let publishService: PublishArticleService;
  let blogAdapter: ArtXFlowBlogAdapter;
  let publicSiteService: PublicSiteService;

  beforeEach(() => {
    articleStore = new Map();
    versionStore = new Map();
    siteStore = new Map();
    destStore = new Map();
    pubStore = new Map();
    pubEvents = [];

    // Setup initial Article in DRAFT
    const initialArticle: Article = {
      id: articleId,
      organizationId: orgId,
      authorId: userId,
      title: 'Full Stack Publishing with ArtXFlow',
      slug: 'full-stack-publishing-with-artxflow',
      excerpt: 'End to end article publishing overview',
      status: 'DRAFT',
      coverAssetId: null,
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };
    articleStore.set(articleId, initialArticle);

    // Setup initial Article Version
    const initialVersion: ArticleVersion = {
      id: versionId,
      articleId,
      versionNumber: 1,
      content: '# Full Stack Publishing\nThis article is distributed automatically.',
      contentFormat: 'markdown',
      metadata: {},
      createdBy: userId,
      createdAt: new Date('2026-06-01T00:00:00Z'),
    };
    versionStore.set(versionId, initialVersion);

    // Setup Hosted Site
    const site: Site = {
      id: siteId,
      organizationId: orgId,
      name: 'Tech Insights',
      subdomain: 'tech-insights',
      customDomain: null,
      status: 'ACTIVE',
      themeConfig: {},
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };
    siteStore.set(siteId, site);

    // Setup Destination
    const destination: Destination = {
      id: destId,
      organizationId: orgId,
      type: 'ARTXFLOW_BLOG',
      name: 'Tech Insights Blog',
      connectionId: null,
      siteId,
      config: { siteId, subdomain: 'tech-insights' },
      status: 'ACTIVE',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };
    destStore.set(destId, destination);

    // Repositories backed by in-memory stores
    articleRepo = {
      findArticleForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        const art = articleStore.get(id);
        return art && art.organizationId === org ? { ...art } : null;
      }),
      findById: vi.fn().mockImplementation(async (id: string) => {
        const art = articleStore.get(id);
        return art ? { ...art } : null;
      }),
      findPublishedBySlug: vi.fn().mockImplementation(async (org: string, slug: string) => {
        for (const art of articleStore.values()) {
          if (art.organizationId === org && art.slug === slug && art.status === 'READY') {
            return { ...art };
          }
        }
        return null;
      }),
      listPublishedByOrganization: vi.fn().mockImplementation(async (org: string) => {
        return Array.from(articleStore.values()).filter(
          (a) => a.organizationId === org && a.status === 'READY',
        );
      }),
      update: vi.fn().mockImplementation(async (id: string, data: Partial<Article>) => {
        const art = articleStore.get(id);
        if (art) {
          const updated = { ...art, ...data, updatedAt: new Date() };
          articleStore.set(id, updated);
          return updated;
        }
        return null;
      }),
    } as unknown as ArticleRepository;

    versionRepo = {
      getLatestVersion: vi.fn().mockImplementation(async (artId: string) => {
        const versions = Array.from(versionStore.values()).filter((v) => v.articleId === artId);
        return versions.sort((a, b) => b.versionNumber - a.versionNumber)[0] || null;
      }),
      findForArticle: vi.fn().mockImplementation(async (artId: string, verId: string) => {
        const ver = versionStore.get(verId);
        return ver && ver.articleId === artId ? { ...ver } : null;
      }),
    } as unknown as ArticleVersionRepository;

    siteRepo = {
      findById: vi.fn().mockImplementation(async (id: string) => siteStore.get(id) || null),
      findBySubdomain: vi.fn().mockImplementation(async (sub: string) => {
        for (const s of siteStore.values()) {
          if (s.subdomain === sub.toLowerCase().trim()) return { ...s };
        }
        return null;
      }),
      listByOrganization: vi.fn().mockImplementation(async (org: string) => {
        return Array.from(siteStore.values()).filter((s) => s.organizationId === org);
      }),
    } as unknown as SiteRepository;

    destRepo = {
      findForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        const d = destStore.get(id);
        return d && d.organizationId === org ? { ...d } : null;
      }),
      listByOrganization: vi.fn().mockImplementation(async (org: string) => {
        return Array.from(destStore.values()).filter((d) => d.organizationId === org);
      }),
    } as unknown as DestinationRepository;

    pubRepo = {
      findForOrganization: vi.fn().mockImplementation(async (org: string, id: string) => {
        const p = pubStore.get(id);
        return p && p.organizationId === org ? { ...p } : null;
      }),
      findByVersionAndDestination: vi
        .fn()
        .mockImplementation(async (org: string, ver: string, dest: string) => {
          for (const p of pubStore.values()) {
            if (
              p.organizationId === org &&
              p.articleVersionId === ver &&
              p.destinationId === dest
            ) {
              return { ...p };
            }
          }
          return null;
        }),
      create: vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
        const id = `pub-${crypto.randomUUID()}`;
        const pub: Publication = {
          id,
          organizationId: data.organizationId as string,
          articleId: data.articleId as string,
          articleVersionId: data.articleVersionId as string,
          destinationId: data.destinationId as string,
          status: (data.status as Publication['status']) || 'PENDING',
          externalResourceId: null,
          externalUrl: null,
          publishedAt: null,
          lastAttemptAt: null,
          attemptCount: 0,
          lastErrorCode: null,
          lastErrorMessage: null,
          overrides: (data.overrides as Record<string, unknown>) || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        pubStore.set(id, pub);
        return pub;
      }),
      updateStatus: vi
        .fn()
        .mockImplementation(async (id: string, _org: string, data: Partial<Publication>) => {
          const p = pubStore.get(id);
          if (p) {
            const updated = { ...p, ...data, updatedAt: new Date() };
            pubStore.set(id, updated);
            return updated;
          }
          throw new Error('Publication not found');
        }),
      listByArticle: vi.fn().mockImplementation(async (org: string, artId: string) => {
        return Array.from(pubStore.values()).filter(
          (p) => p.organizationId === org && p.articleId === artId,
        );
      }),
      listByArticleVersion: vi.fn().mockImplementation(async (org: string, verId: string) => {
        return Array.from(pubStore.values()).filter(
          (p) => p.organizationId === org && p.articleVersionId === verId,
        );
      }),
    } as unknown as PublicationRepository;

    pubEventRepo = {
      create: vi.fn().mockImplementation(async (event: Record<string, unknown>) => {
        pubEvents.push(event as (typeof pubEvents)[0]);
        return { id: `evt-${crypto.randomUUID()}` };
      }),
    } as unknown as PublicationEventRepository;

    orgRepo = {
      getOrganizationForUser: vi.fn().mockImplementation(async (org: string, usr: string) => {
        return org === orgId && usr === userId
          ? { organization: { id: orgId }, role: 'OWNER' }
          : null;
      }),
    } as unknown as OrganizationRepository;

    jobQueue = new MemoryJobQueue();

    publishService = new PublishArticleService({
      articleRepo,
      articleVersionRepo: versionRepo,
      destinationRepo: destRepo,
      publicationRepo: pubRepo,
      publicationEventRepo: pubEventRepo,
      siteRepo,
      orgRepo,
      jobQueue,
    });

    blogAdapter = new ArtXFlowBlogAdapter({
      articleRepo,
      siteRepo,
      versionRepo,
    });
    platformAdapterRegistry.register(blogAdapter);

    publicSiteService = new PublicSiteService(siteRepo, articleRepo, versionRepo);
  });

  it('completes the full publishing lifecycle: Create -> Publish -> Inngest/Adapter -> Public Site', async () => {
    // 1. Initial State: Article is in DRAFT and not yet visible on public site
    const publicBeforePublish = await publicSiteService.getPublicArticle(
      'tech-insights',
      'full-stack-publishing-with-artxflow',
    );
    expect(publicBeforePublish).toBeNull();

    // 2. Publish Trigger: Non-blocking asynchronous publish request
    const publishResult = await publishService.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId] },
    );

    // Assert: Asynchronous return
    expect(publishResult.articleId).toBe(articleId);
    expect(publishResult.articleVersionId).toBe(versionId);
    expect(publishResult.publications).toHaveLength(1);
    expect(publishResult.publications[0]?.status).toBe('QUEUED');
    expect(publishResult.jobId).toBeDefined();

    // Assert: Background job was enqueued in the workflow queue
    const queuedJobs = jobQueue.listJobs();
    expect(queuedJobs).toHaveLength(1);
    expect(queuedJobs[0]?.type).toBe('DISTRIBUTE_ARTICLE');
    expect(queuedJobs[0]?.idempotencyKey).toBe(`${orgId}:${versionId}:distribute`);

    // 3. Workflow Worker Execution: executes ArtXFlowBlogAdapter
    const queuedPub = pubStore.get(publishResult.publications[0]!.id);
    expect(queuedPub).toBeDefined();

    // Transform canonical article and publish via adapter
    const canonical = {
      id: articleId,
      versionId,
      title: initialArticle().title,
      markdown: initialVersion().content,
      tags: [],
    };
    const platformArticle = await blogAdapter.transform(canonical);
    const adapterResult = await blogAdapter.publish({
      publicationId: queuedPub!.id,
      article: platformArticle,
      destinationConfig: { siteId },
    });

    // Update publication record to PUBLISHED (as worker Step 5 does)
    await pubRepo.updateStatus(queuedPub!.id, orgId, {
      status: 'PUBLISHED',
      externalResourceId: adapterResult.externalResourceId,
      externalUrl: adapterResult.externalUrl,
      publishedAt: new Date(adapterResult.publishedAt),
    });

    // 4. Verification: Publication state is updated
    const finalPub = pubStore.get(queuedPub!.id);
    expect(finalPub?.status).toBe('PUBLISHED');
    expect(finalPub?.externalResourceId).toBe(articleId);
    expect(finalPub?.externalUrl).toBe('/sites/tech-insights/full-stack-publishing-with-artxflow');

    // 5. Verification: Article status transitioned to READY in database
    const updatedArticle = articleStore.get(articleId);
    expect(updatedArticle?.status).toBe('READY');

    // 6. Verification: Public Article is now live and queryable via PublicSiteService
    const publicArticle = await publicSiteService.getPublicArticle(
      'tech-insights',
      'full-stack-publishing-with-artxflow',
    );
    expect(publicArticle).not.toBeNull();
    expect(publicArticle?.article.id).toBe(articleId);
    expect(publicArticle?.article.title).toBe('Full Stack Publishing with ArtXFlow');
    expect(publicArticle?.version.content).toContain('This article is distributed automatically.');

    // 7. Verification: Public Site article listing includes the article
    const siteArticles = await publicSiteService.listPublicArticles('tech-insights');
    expect(siteArticles).not.toBeNull();
    expect(siteArticles?.articles.some((a) => a.id === articleId)).toBe(true);
  });

  it('publishes article preserving canonical content while applying destination overrides', async () => {
    const publishResult = await publishService.publishArticle(
      { userId, organizationId: orgId },
      {
        articleId,
        destinationIds: [destId],
        destinationOverrides: {
          [destId]: {
            title: 'Custom Destination Title',
            description: 'Customized preview description',
            tags: ['dev', 'architecture'],
            canonicalUrl: 'https://external-site.io/my-article',
          },
        },
      },
    );

    expect(publishResult.publications).toHaveLength(1);
    const pubDto = publishResult.publications[0];
    expect(pubDto.overrides).toEqual({
      title: 'Custom Destination Title',
      description: 'Customized preview description',
      tags: ['dev', 'architecture'],
      canonicalUrl: 'https://external-site.io/my-article',
    });

    // Simulate worker override application
    const canonical = {
      id: articleId,
      versionId,
      title: initialArticle().title,
      excerpt: initialArticle().excerpt,
      markdown: initialVersion().content,
      tags: [],
    };
    const effectiveArticle = applyDestinationOverrides(canonical, pubDto.overrides);

    expect(effectiveArticle.title).toBe('Custom Destination Title');
    expect(effectiveArticle.excerpt).toBe('Customized preview description');
    expect(effectiveArticle.tags).toEqual(['dev', 'architecture']);
    expect(effectiveArticle.canonicalUrl).toBe('https://external-site.io/my-article');
    // Invariant: Markdown remains untouched
    expect(effectiveArticle.markdown).toBe(initialVersion().content);
  });

  it('handles partial distribution: one destination succeeds and one fails without erasing success, allowing manual retry', async () => {
    // 1. Setup a second destination (e.g. DEV.to)
    const devtoDestId = '00000000-0000-0000-0000-000000000006';
    const devtoDest: Destination = {
      id: devtoDestId,
      organizationId: orgId,
      type: 'DEVTO',
      name: 'Engineering Channel',
      connectionId: 'conn-1',
      siteId: null,
      config: {},
      status: 'ACTIVE',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      updatedAt: new Date('2026-06-01T00:00:00Z'),
    };
    destStore.set(devtoDestId, devtoDest);

    // 2. Publish to both destinations
    const publishResult = await publishService.publishArticle(
      { userId, organizationId: orgId },
      { articleId, destinationIds: [destId, devtoDestId] },
    );

    expect(publishResult.publications).toHaveLength(2);
    const blogPub = publishResult.publications.find((p) => p.destinationId === destId)!;
    const devtoPub = publishResult.publications.find((p) => p.destinationId === devtoDestId)!;

    // 3. Blog destination succeeds
    await pubRepo.updateStatus(blogPub.id, orgId, {
      status: 'PUBLISHED',
      externalResourceId: articleId,
      externalUrl: '/sites/tech-insights/full-stack-publishing-with-artxflow',
      publishedAt: new Date(),
    });
    await articleRepo.update(articleId, { status: 'READY' });

    // 4. DEV.to destination fails with rate limit or network error
    await pubRepo.updateStatus(devtoPub.id, orgId, {
      status: 'FAILED',
      lastErrorCode: 'RATE_LIMITED',
      lastErrorMessage: 'DEV.to rate limit reached',
    });

    // 5. Verification: Blog success is NOT erased!
    const finalBlogPub = pubStore.get(blogPub.id)!;
    const finalDevtoPub = pubStore.get(devtoPub.id)!;
    expect(finalBlogPub.status).toBe('PUBLISHED');
    expect(finalBlogPub.externalUrl).toBe(
      '/sites/tech-insights/full-stack-publishing-with-artxflow',
    );
    expect(finalDevtoPub.status).toBe('FAILED');
    expect(finalDevtoPub.lastErrorCode).toBe('RATE_LIMITED');

    // Article status is live (READY) on the blog
    expect(articleStore.get(articleId)?.status).toBe('READY');

    // 6. Aggregate distribution status is PARTIALLY_PUBLISHED
    const aggregateStatus = calculateDistributionStatus([finalBlogPub, finalDevtoPub]);
    expect(aggregateStatus).toBe('PARTIALLY_PUBLISHED');

    // 7. Manual retry specifically targets the failed DEV.to destination
    const pubService = new PublicationService(
      destRepo,
      pubRepo,
      pubEventRepo,
      siteRepo,
      articleRepo,
      versionRepo,
      undefined,
      jobQueue,
    );

    const retryResult = await pubService.retryPublication(
      { userId, organizationId: orgId },
      devtoPub.id,
    );

    expect(retryResult.status).toBe('QUEUED');
    expect(pubStore.get(devtoPub.id)?.status).toBe('QUEUED');
    // Invariant: Blog destination remains untouched in PUBLISHED status
    expect(pubStore.get(blogPub.id)?.status).toBe('PUBLISHED');
  });

  function initialArticle(): Article {
    return articleStore.get(articleId)!;
  }

  function initialVersion(): ArticleVersion {
    return versionStore.get(versionId)!;
  }
});
