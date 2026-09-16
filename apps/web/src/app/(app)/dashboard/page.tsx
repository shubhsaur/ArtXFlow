import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleRepository, scheduleRepository } from '@artxflow/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@artxflow/ui';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  const [articles, schedules] = await Promise.all([
    articleRepository.listByOrganization(organization.id),
    scheduleRepository.listByOrganization(organization.id),
  ]);
  const articlesCount = articles.length;
  const activeSchedulesCount = schedules.filter((s) => s.status === 'SCHEDULED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary, #F5F7FA)',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome, {user.name || user.email.split('@')[0]}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              marginTop: '4px',
            }}
          >
            Here is what is happening across your content distribution pipelines.
          </p>
        </div>

        <Link href="/articles/new">
          <Button variant="primary">+ New Article</Button>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <Link href="/articles" style={{ textDecoration: 'none' }}>
          <Card style={{ cursor: 'pointer' }}>
            <CardHeader>
              <CardDescription>Canonical Articles</CardDescription>
              <CardTitle style={{ fontSize: '24px', marginTop: '8px' }}>{articlesCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
                {articlesCount === 0
                  ? 'No articles created yet. Start authoring to distribute across platforms.'
                  : `${articlesCount} canonical article${articlesCount === 1 ? '' : 's'} managed.`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader>
            <CardDescription>Scheduled Releases</CardDescription>
            <CardTitle style={{ fontSize: '24px', marginTop: '8px' }}>
              {activeSchedulesCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
              {activeSchedulesCount === 0
                ? 'No releases currently scheduled. Plan article releases in advance.'
                : `${activeSchedulesCount} article release${activeSchedulesCount === 1 ? '' : 's'} queued for publication.`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Connected Destinations</CardDescription>
            <CardTitle style={{ fontSize: '24px', marginTop: '8px' }}>0</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
              Connect DEV.to, Medium, Hashnode, or ArtXFlow hosted blog.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Active Workflows</CardDescription>
            <CardTitle style={{ fontSize: '24px', marginTop: '8px' }}>Idle</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)' }}>
              Inngest background publication pipeline is healthy and ready.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with ArtXFlow</CardTitle>
          <CardDescription>
            Follow these steps to distribute your canonical content across developer platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol
            style={{
              paddingLeft: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '14px',
              color: 'var(--text-primary, #F5F7FA)',
            }}
          >
            <li>
              <strong>Configure destinations:</strong> Link your external publishing accounts in
              Settings.
            </li>
            <li>
              <strong>Write your canonical article:</strong> Author in Markdown with rich media
              support.
            </li>
            <li>
              <strong>Preview & Distribute:</strong> Select destinations and trigger background
              publication workflows.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
