import React from 'react';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  articleRepository,
  scheduleRepository,
  destinationRepository,
  platformConnectionRepository,
  platformAccountRepository,
  publicationRepository,
  siteRepository,
  profileRepository,
  type Publication,
} from '@artxflow/database';
import { DashboardHeader } from '../../../components/dashboard/dashboard-header';
import { DashboardMetrics } from '../../../components/dashboard/dashboard-metrics';
import { DashboardOnboarding } from '../../../components/dashboard/dashboard-onboarding';
import {
  RecentArticlesTable,
  type DashboardArticleItem,
} from '../../../components/dashboard/recent-articles-table';
import {
  ChannelStatusWidget,
  type ChannelInfo,
} from '../../../components/dashboard/channel-status-widget';
import {
  ScheduledPipelineWidget,
  type UpcomingScheduleItem,
} from '../../../components/dashboard/scheduled-pipeline-widget';
import {
  DashboardActivityFeed,
  type ActivityEventItem,
} from '../../../components/dashboard/dashboard-activity-feed';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization, membership } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  // Parallel data resolution across repositories
  const [articles, schedules, destinations, connections, publications, sites, fullProfile] =
    await Promise.all([
      articleRepository.listByOrganization(organization.id),
      scheduleRepository.listByOrganization(organization.id),
      destinationRepository.listByOrganization(organization.id),
      platformConnectionRepository.listByOrganization(organization.id),
      publicationRepository.listByOrganization(organization.id),
      siteRepository.listByOrganization(organization.id),
      profileRepository.getFullUserProfile(user.id),
    ]);

  // Load account usernames/profiles for connected platforms
  const accountsByConnectionId = new Map<string, string>();
  await Promise.all(
    connections.map(async (conn) => {
      try {
        const accs = await platformAccountRepository.listByConnection(conn.id);
        if (accs.length > 0) {
          const primary = accs[0];
          accountsByConnectionId.set(conn.id, primary.username || primary.displayName || '');
        }
      } catch {
        // Non-blocking fallback
      }
    }),
  );

  // Articles metrics
  const articlesCount = articles.length;
  const publishedCount = articles.filter((a) => a.status === 'READY').length;
  const draftCount = articles.filter((a) => a.status === 'DRAFT').length;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articlesThisWeek = articles.filter(
    (a) =>
      new Date(a.createdAt).getTime() >= oneWeekAgo.getTime() ||
      new Date(a.updatedAt).getTime() >= oneWeekAgo.getTime(),
  ).length;

  // Schedules metrics
  const activeSchedules = schedules.filter((s) => s.status === 'SCHEDULED');
  const activeSchedulesCount = activeSchedules.length;

  // Map destinations by ID for lookup
  const destinationsMap = new Map(destinations.map((d) => [d.id, d]));

  // Group publications by articleId
  const publicationsByArticle = new Map<string, Publication[]>();
  for (const pub of publications) {
    const list = publicationsByArticle.get(pub.articleId) || [];
    list.push(pub);
    publicationsByArticle.set(pub.articleId, list);
  }

  const totalPublicationsCount = publications.length;
  const successfulPublicationsCount = publications.filter((p) => p.status === 'PUBLISHED').length;
  const failedPublicationsCount = publications.filter((p) => p.status === 'FAILED').length;

  // Connected providers
  const connectedPlatformProviders = new Set(
    connections.filter((c) => c.status === 'CONNECTED').map((c) => c.provider.toLowerCase()),
  );
  const activeProviders: string[] = Array.from(connectedPlatformProviders);
  activeProviders.push('site'); // Built-in hosted blog is always active
  const connectedChannelsCount = Math.min(4, connectedPlatformProviders.size + 1);

  // Next scheduled date preview
  let nextScheduledDate: string | null = null;
  if (activeSchedules.length > 0) {
    const sortedSchedules = [...activeSchedules].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    nextScheduledDate = new Date(sortedSchedules[0].scheduledAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  // Prepare recent 5 articles with publication status summaries
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const topRecentArticles = sortedArticles.slice(0, 5);

  const recentArticlesData: DashboardArticleItem[] = topRecentArticles.map((article) => {
    const articlePubs = publicationsByArticle.get(article.id) || [];
    const pubSummaries = articlePubs.map((pub) => {
      const dest = destinationsMap.get(pub.destinationId);
      return {
        destinationType: dest?.type || 'unknown',
        status: pub.status,
        externalUrl: pub.externalUrl,
      };
    });

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      updatedAt: article.updatedAt,
      publications: pubSummaries,
      canonicalBranch: 'main',
      commitHash: article.id.slice(-6),
    };
  });

  // Prepare live recent activity events from publications
  const sortedPublications = [...publications].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const recentActivityEvents: ActivityEventItem[] = sortedPublications.slice(0, 3).map((pub) => {
    const art = articles.find((a) => a.id === pub.articleId);
    const dest = destinationsMap.get(pub.destinationId);
    const destType = dest?.type?.toUpperCase() || 'BLOG';
    const status: 'SUCCESS' | 'IN_FLIGHT' | 'FAILED' =
      pub.status === 'PUBLISHED' ? 'SUCCESS' : pub.status === 'FAILED' ? 'FAILED' : 'IN_FLIGHT';
    const title = `${destType} ${pub.status === 'PUBLISHED' ? 'Synced' : pub.status === 'FAILED' ? 'Sync Failed' : 'Dispatching'}`;
    const latency =
      pub.status === 'PUBLISHED' ? '182ms' : pub.status === 'FAILED' ? 'Failed' : 'In flight';

    const diffMinutes = Math.floor((Date.now() - new Date(pub.updatedAt).getTime()) / 60000);
    const timestamp =
      diffMinutes < 1
        ? 'Now'
        : diffMinutes < 60
          ? `${diffMinutes}m ago`
          : `${Math.floor(diffMinutes / 60)}h ago`;

    return {
      id: pub.id,
      title,
      slug: art?.slug ? `/${art.slug}` : '/article',
      status,
      timestamp,
      latency,
    };
  });

  // Prepare publishing channels status
  const devConn = connections.find(
    (c) => c.provider.toLowerCase() === 'devto' && c.status === 'CONNECTED',
  );
  const devAccount = devConn ? accountsByConnectionId.get(devConn.id) : null;

  const medConn = connections.find(
    (c) => c.provider.toLowerCase() === 'medium' && c.status === 'CONNECTED',
  );
  const medAccount = medConn ? accountsByConnectionId.get(medConn.id) : null;
  const medMeta = medConn?.tokenMetadata as Record<string, unknown> | undefined;
  const medMode =
    (medMeta?.mediumPublishMode as string) || (medMeta?.clientManaged ? 'extension' : 'api');
  const medModeLabel = medConn
    ? medMode === 'extension'
      ? '⚡ Extension'
      : medMode === 'medium_new'
        ? '📋 new-story'
        : medMode === 'manual'
          ? '🔗 Manual'
          : '🔑 API'
    : null;

  const hashConn = connections.find(
    (c) => c.provider.toLowerCase() === 'hashnode' && c.status === 'CONNECTED',
  );
  const hashAccount = hashConn ? accountsByConnectionId.get(hashConn.id) : null;
  const hashMeta = hashConn?.tokenMetadata as Record<string, unknown> | undefined;
  const hashMode = (hashMeta?.hashnodePublishMode as string) || 'extension';
  const hashModeLabel = hashConn
    ? hashMode === 'extension'
      ? '⚡ Extension'
      : hashMode === 'hn_new'
        ? '📋 hn.new'
        : hashMode === 'manual'
          ? '🔗 Manual'
          : '🔑 API'
    : null;

  const primarySite = sites[0];
  const hostedSiteUrl = primarySite
    ? `https://${primarySite.subdomain}.artxflow.com`
    : `https://${organization.slug}.artxflow.com`;

  const channels: ChannelInfo[] = [
    {
      id: 'devto',
      name: 'DEV.to',
      isConnected: Boolean(devConn),
      accountHandle: devAccount,
      badgeColor: '#0B87FE',
      iconText: 'DEV',
    },
    {
      id: 'medium',
      name: 'Medium',
      isConnected: Boolean(medConn),
      accountHandle: medAccount,
      modeLabel: medModeLabel,
      badgeColor: '#00AB6C',
      iconText: 'M',
    },
    {
      id: 'hashnode',
      name: 'Hashnode',
      isConnected: Boolean(hashConn),
      accountHandle: hashAccount,
      modeLabel: hashModeLabel,
      badgeColor: '#2962FF',
      iconText: 'HN',
    },
    {
      id: 'site',
      name: 'ArtXFlow Hosted Site',
      isConnected: true,
      accountHandle: primarySite?.subdomain || organization.slug,
      modeLabel: 'Built-in',
      badgeColor: 'var(--axf-cyan, #19D7FE)',
      iconText: 'AXF',
    },
  ];

  // Prepare upcoming schedules
  const articlesMap = new Map(articles.map((a) => [a.id, a]));
  const sortedActiveSchedules = [...activeSchedules].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
  );
  const upcomingSchedules: UpcomingScheduleItem[] = sortedActiveSchedules.slice(0, 3).map((s) => {
    const art = articlesMap.get(s.articleId);
    const destIds = (s.destinationIds as string[]) || [];
    return {
      id: s.id,
      articleId: s.articleId,
      articleTitle: art?.title || 'Untitled Article',
      scheduledAt: s.scheduledAt,
      destinationCount: destIds.length,
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header with greeting, workspace badge, and action bar */}
      <DashboardHeader
        userName={user.name || user.email.split('@')[0]}
        organizationName={organization.name}
        role={membership.role}
        hasActiveSchedules={activeSchedulesCount > 0}
      />

      {/* 2. 3-Card Bento KPI Grid */}
      <DashboardMetrics
        articlesCount={articlesCount}
        publishedCount={publishedCount}
        draftCount={draftCount}
        connectedChannelsCount={connectedChannelsCount}
        activeProviders={activeProviders}
        totalPublicationsCount={totalPublicationsCount}
        successfulPublicationsCount={successfulPublicationsCount}
        failedPublicationsCount={failedPublicationsCount}
        activeSchedulesCount={activeSchedulesCount}
        nextScheduledDate={nextScheduledDate}
        articlesThisWeek={articlesThisWeek}
      />

      {/* 3. Onboarding Launchpad Checklist (dynamic progress & dismissible per user account) */}
      <DashboardOnboarding
        userId={user.id}
        initialDismissed={fullProfile?.launchpadDismissed ?? false}
        organizationName={organization.name}
        hasConnectedPlatforms={connectedPlatformProviders.size > 0}
        hasArticles={articlesCount > 0}
        hasPublications={totalPublicationsCount > 0}
      />

      {/* 4. Streamlined Publication Table */}
      <RecentArticlesTable articles={recentArticlesData} totalArticlesCount={articlesCount} />

      {/* 5. Live Activity Stream Feed */}
      <DashboardActivityFeed events={recentActivityEvents} />

      {/* 6. Active Channels & Scheduled Pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <ChannelStatusWidget channels={channels} hostedSiteUrl={hostedSiteUrl} />

        <ScheduledPipelineWidget schedules={upcomingSchedules} />
      </div>
    </div>
  );
}
