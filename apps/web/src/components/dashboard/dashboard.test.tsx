import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DashboardHeader,
  DashboardMetrics,
  DashboardOnboarding,
  RecentArticlesTable,
  ChannelStatusWidget,
  ScheduledPipelineWidget,
  DashboardActivityFeed,
} from './index';

describe('Dashboard Components (Stitch Design Pattern System)', () => {
  describe('DashboardHeader', () => {
    it('renders user greeting, organization badge, and action links', () => {
      const html = renderToStaticMarkup(
        <DashboardHeader
          userName="Shubham"
          organizationName="Acme Corp"
          role="OWNER"
          hasActiveSchedules={true}
        />,
      );

      expect(html).toContain('Overview');
      expect(html).toContain('Welcome back, Shubham');
      expect(html).toContain('Acme Corp');
      expect(html).toContain('OWNER');
      expect(html).toContain('Scheduled releases queued');
      expect(html).toContain('Sync All Destinations');
      expect(html).toContain('Connect Channels');
      expect(html).toContain('All Articles');
      expect(html).toContain('New Article');
    });

    it('displays inngest pipeline operational when no active schedules', () => {
      const html = renderToStaticMarkup(
        <DashboardHeader
          userName="Alex"
          organizationName="DevLab"
          role="MEMBER"
          hasActiveSchedules={false}
        />,
      );

      expect(html).toContain('Welcome back, Alex');
      expect(html).toContain('Inngest pipeline operational');
    });
  });

  describe('DashboardMetrics', () => {
    it('renders 3-card Bento KPI grid with live numbers and breakdown pills', () => {
      const html = renderToStaticMarkup(
        <DashboardMetrics
          articlesCount={12}
          publishedCount={8}
          draftCount={4}
          connectedChannelsCount={3}
          activeProviders={['devto', 'medium', 'site']}
          totalPublicationsCount={24}
          successfulPublicationsCount={22}
          failedPublicationsCount={2}
          activeSchedulesCount={3}
          nextScheduledDate="Oct 24"
          articlesThisWeek={3}
        />,
      );

      // Card 1: Articles Published
      expect(html).toContain('Articles Published');
      expect(html).toContain('12');
      expect(html).toContain('+3 this week');
      expect(html).toContain('8 published · 4 drafts');
      expect(html).toContain('Canonical Git repo connected');

      // Card 2: Active Destinations
      expect(html).toContain('Active Destinations');
      expect(html).toContain('3');
      expect(html).toContain('/ 4');
      expect(html).toContain('2 Attention Needed');
      expect(html).toContain('DEV, Medium, Blog');

      // Card 3: Sync Health
      expect(html).toContain('Sync Health');
      expect(html).toContain('91.7%');
      expect(html).toContain('3 queued');
      expect(html).toContain('1.2s avg latency across adapters');
      expect(html).toContain('Failures: 2');
    });

    it('renders 100% health and Healthy badge when there are no failed publications', () => {
      const html = renderToStaticMarkup(
        <DashboardMetrics
          articlesCount={5}
          publishedCount={5}
          draftCount={0}
          connectedChannelsCount={4}
          activeProviders={['devto', 'medium', 'hashnode', 'site']}
          totalPublicationsCount={15}
          successfulPublicationsCount={15}
          failedPublicationsCount={0}
          activeSchedulesCount={0}
        />,
      );

      expect(html).toContain('100.0%');
      expect(html).toContain('Healthy');
      expect(html).toContain('All synced');
    });
  });

  describe('DashboardOnboarding', () => {
    it('renders 4 checklist steps with accurate completion state', () => {
      const html = renderToStaticMarkup(
        <DashboardOnboarding
          organizationName="ArtXFlow Team"
          hasConnectedPlatforms={true}
          hasArticles={false}
          hasPublications={false}
        />,
      );

      expect(html).toContain('Workspace Launchpad');
      expect(html).toContain('2 of 4 completed (50%)');
      expect(html).toContain('Personal Workspace Initialized');
      expect(html).toContain('Link Developer Publishing Platforms');
      expect(html).toContain('Draft Your First Canonical Article');
      expect(html).toContain('Broadcast Cross-Platform Distribution');
      expect(html).toContain('Write Article');
    });

    it('returns empty string when all 4 steps are completed', () => {
      const html = renderToStaticMarkup(
        <DashboardOnboarding
          organizationName="ArtXFlow Team"
          hasConnectedPlatforms={true}
          hasArticles={true}
          hasPublications={true}
        />,
      );

      expect(html).toBe('');
    });

    it('renders the dismiss close button with accessible label', () => {
      const html = renderToStaticMarkup(
        <DashboardOnboarding
          organizationName="ArtXFlow Team"
          hasConnectedPlatforms={false}
          hasArticles={false}
          hasPublications={false}
        />,
      );

      expect(html).toContain('aria-label="Dismiss Workspace Launchpad"');
      expect(html).toContain('close');
    });
  });

  describe('RecentArticlesTable', () => {
    it('renders helpful empty state when no articles exist', () => {
      const html = renderToStaticMarkup(
        <RecentArticlesTable articles={[]} totalArticlesCount={0} />,
      );

      expect(html).toContain('No canonical articles authored yet');
      expect(html).toContain('Technical Deep Dive');
      expect(html).toContain('Product Release Notes');
      expect(html).toContain('Developer Guide &amp; Tips');
      expect(html).toContain('Author First Canonical Article');
    });

    it('renders articles table with filter tabs, canonical sources, and destination chips', () => {
      const sampleArticles = [
        {
          id: 'art-1',
          title: 'Scaling Monorepos with Turbo & Next.js',
          slug: 'scaling-monorepos',
          status: 'READY',
          updatedAt: new Date().toISOString(),
          canonicalBranch: 'main',
          commitHash: '8f2c01',
          publications: [
            {
              destinationType: 'devto',
              status: 'PUBLISHED',
              externalUrl: 'https://dev.to/example/scaling-monorepos',
            },
            {
              destinationType: 'medium',
              status: 'PUBLISHED',
              externalUrl: 'https://medium.com/@user/scaling-monorepos',
            },
          ],
        },
      ];

      const html = renderToStaticMarkup(
        <RecentArticlesTable articles={sampleArticles} totalArticlesCount={1} />,
      );

      expect(html).toContain('Recent Articles');
      expect(html).toContain('1 total');
      expect(html).toContain('All');
      expect(html).toContain('Synced');
      expect(html).toContain('Needs Attention');
      expect(html).toContain('Scaling Monorepos with Turbo &amp; Next.js');
      expect(html).toContain('/scaling-monorepos');
      expect(html).toContain('READY');
      expect(html).toContain('main');
      expect(html).toContain('#8f2c01');
      expect(html).toContain('DEV');
      expect(html).toContain('Medium');
      expect(html).toContain('Blog');
      expect(html).toContain('Open');
    });
  });

  describe('DashboardActivityFeed', () => {
    it('renders live activity stream header and default event cards', () => {
      const html = renderToStaticMarkup(<DashboardActivityFeed />);

      expect(html).toContain('Recent Activity');
      expect(html).toContain('Live stream');
      expect(html).toContain('Hashnode GraphQL Synced');
      expect(html).toContain('/blog/postgres-pooling-serverless');
      expect(html).toContain('Dispatching DEV.to Markdown');
    });

    it('renders custom live activity events when provided', () => {
      const customEvents = [
        {
          id: 'ev-test',
          title: 'DEV.to Markdown Synced',
          slug: '/scaling-monorepos',
          status: 'SUCCESS' as const,
          timestamp: 'Just now',
          latency: '142ms',
        },
      ];

      const html = renderToStaticMarkup(<DashboardActivityFeed events={customEvents} />);

      expect(html).toContain('DEV.to Markdown Synced');
      expect(html).toContain('/scaling-monorepos');
      expect(html).toContain('Just now');
      expect(html).toContain('142ms');
    });
  });

  describe('ChannelStatusWidget', () => {
    it('renders channel connection statuses and accounts', () => {
      const channels = [
        {
          id: 'devto' as const,
          name: 'DEV.to',
          isConnected: true,
          accountHandle: 'shubhsaur',
          badgeColor: '#0B87FE',
          iconText: 'DEV',
        },
        {
          id: 'medium' as const,
          name: 'Medium',
          isConnected: false,
          badgeColor: '#00AB6C',
          iconText: 'M',
        },
      ];

      const html = renderToStaticMarkup(
        <ChannelStatusWidget channels={channels} hostedSiteUrl="https://acme.artxflow.com" />,
      );

      expect(html).toContain('Publishing Channels');
      expect(html).toContain('DEV.to');
      expect(html).toContain('@shubhsaur');
      expect(html).toContain('Live');
      expect(html).toContain('Medium');
      expect(html).toContain('Not configured');
      expect(html).toContain('Connect +');
      expect(html).toContain('acme.artxflow.com ↗');
    });
  });

  describe('ScheduledPipelineWidget', () => {
    it('renders upcoming schedules and canonical SEO protection card', () => {
      const schedules = [
        {
          id: 'sched-1',
          articleId: 'art-1',
          articleTitle: 'Distributed Systems 101',
          scheduledAt: '2026-10-24T10:00:00.000Z',
          destinationCount: 3,
        },
      ];

      const html = renderToStaticMarkup(<ScheduledPipelineWidget schedules={schedules} />);

      expect(html).toContain('Distribution Pipeline');
      expect(html).toContain('Worker Active');
      expect(html).toContain('Distributed Systems 101');
      expect(html).toContain('3 channels');
      expect(html).toContain('SEO Canonical Protection');
    });

    it('renders zero pending releases state when schedule queue is empty', () => {
      const html = renderToStaticMarkup(<ScheduledPipelineWidget schedules={[]} />);

      expect(html).toContain('Zero Pending Releases');
      expect(html).toContain('SEO Canonical Protection');
    });
  });
});
