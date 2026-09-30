import React from 'react';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  articleRepository,
  articleVersionRepository,
  scheduleRepository,
  publicationRepository,
  destinationRepository,
  siteRepository,
  type Publication,
} from '@artxflow/database';
import { calculateReadingStats } from '../../../components/editor/formatting-helpers';
import { ArticlesHubClient } from '../../../components/articles/articles-hub-client';
import type { ArticleItemData } from '../../../components/articles/articles-hub-matrix-table';

export const dynamic = 'force-dynamic';

export default async function ArticlesListPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  // Parallel data resolution
  const [articles, schedules, publications, destinations, sites] = await Promise.all([
    articleRepository.listByOrganization(organization.id),
    scheduleRepository.listByOrganization(organization.id),
    publicationRepository.listByOrganization(organization.id),
    destinationRepository.listByOrganization(organization.id),
    siteRepository.listByOrganization(organization.id),
  ]);

  // Destination map
  const destinationsMap = new Map(destinations.map((d) => [d.id, d]));

  // Active schedules map
  const activeSchedulesByArticle = new Map(
    schedules.filter((s) => s.status === 'SCHEDULED').map((s) => [s.articleId, s]),
  );

  // Publications grouped by article
  const publicationsByArticle = new Map<string, Publication[]>();
  for (const pub of publications) {
    const list = publicationsByArticle.get(pub.articleId) || [];
    list.push(pub);
    publicationsByArticle.set(pub.articleId, list);
  }

  // Canonical base domain
  const primarySite = sites[0];
  const canonicalDomain = primarySite
    ? `${primarySite.subdomain}.artxflow.com`
    : `${organization.slug}.artxflow.dev`;
  const canonicalBaseUrl = `https://${canonicalDomain}`;

  // Fetch latest version in parallel for each article to get accurate reading stats and tags
  const versions = await Promise.all(
    articles.map((article) =>
      articleVersionRepository.getLatestVersion(article.id).catch(() => null),
    ),
  );

  const allTagsSet = new Set<string>();

  // Assemble full ArticleItemData list
  const formattedArticles: ArticleItemData[] = articles.map((article, idx) => {
    const version = versions[idx];
    const content = version?.content || '';
    const stats = calculateReadingStats(content);

    const metadata = (version?.metadata || {}) as Record<string, unknown>;
    const tags = Array.isArray(metadata.tags)
      ? (metadata.tags as string[]).map((t) => String(t).trim()).filter(Boolean)
      : [];

    for (const tag of tags) {
      allTagsSet.add(tag);
    }

    const articlePubs = publicationsByArticle.get(article.id) || [];
    const formattedPubs = articlePubs.map((pub) => {
      const dest = destinationsMap.get(pub.destinationId);
      return {
        destinationId: pub.destinationId,
        destinationType: dest?.type || 'unknown',
        status: pub.status,
        externalUrl: pub.externalUrl,
        lastErrorMessage: pub.lastErrorMessage,
        lastErrorCode: pub.lastErrorCode,
      };
    });

    const activeSchedule = activeSchedulesByArticle.get(article.id);

    const canonicalUrl = typeof metadata.canonicalUrl === 'string' && metadata.canonicalUrl.trim()
      ? metadata.canonicalUrl.trim()
      : `${canonicalBaseUrl}/blog/${article.slug}`;

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      updatedAt: article.updatedAt,
      createdAt: article.createdAt,
      words: stats.words,
      readingTimeMinutes: stats.readingTimeMinutes,
      tags,
      canonicalUrl,
      canonicalDomain,
      publications: formattedPubs,
      isScheduled: Boolean(activeSchedule),
      scheduledAt: activeSchedule?.scheduledAt,
    };
  });

  // Calculate metrics
  const totalArticles = articles.length;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articlesThisWeek = articles.filter(
    (a) =>
      new Date(a.createdAt).getTime() >= oneWeekAgo.getTime() ||
      new Date(a.updatedAt).getTime() >= oneWeekAgo.getTime(),
  ).length;

  const syncedCount = formattedArticles.filter(
    (a) => a.publications.some((p) => p.status === 'PUBLISHED') || a.status === 'READY',
  ).length;
  const syncedPercentage = totalArticles > 0 ? Math.round((syncedCount / totalArticles) * 100) : 0;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;
  const issuesCount = formattedArticles.filter((a) =>
    a.publications.some((p) => p.status === 'FAILED'),
  ).length;
  const stagedDispatchesCount = schedules.filter((s) => s.status === 'SCHEDULED').length;

  const metrics = {
    totalArticles,
    articlesThisWeek,
    syncedCount,
    syncedPercentage,
    draftCount,
    issuesCount,
    stagedDispatchesCount,
  };

  return (
    <ArticlesHubClient
      initialArticles={formattedArticles}
      metrics={metrics}
      availableTags={Array.from(allTagsSet).sort()}
    />
  );
}
