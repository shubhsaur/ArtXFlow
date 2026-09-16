import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleRepository, scheduleRepository, publicationRepository } from '@artxflow/database';
import { calculateDistributionStatus } from '@artxflow/publishing';
import { Button, Card, Badge } from '@artxflow/ui';
import type { Publication } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export default async function ArticlesListPage() {
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  const [articles, schedules, publications] = await Promise.all([
    articleRepository.listByOrganization(organization.id),
    scheduleRepository.listByOrganization(organization.id),
    publicationRepository.listByOrganization(organization.id),
  ]);

  const activeSchedulesByArticle = new Map(
    schedules.filter((s) => s.status === 'SCHEDULED').map((s) => [s.articleId, s]),
  );

  const publicationsByArticle = new Map<string, Publication[]>();
  for (const pub of publications) {
    const list = publicationsByArticle.get(pub.articleId) || [];
    list.push(pub);
    publicationsByArticle.set(pub.articleId, list);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
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
            Canonical Articles
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-secondary, #AAB5C4)',
              marginTop: '4px',
            }}
          >
            Your organization&apos;s source of truth content library.
          </p>
        </div>

        <Link href="/articles/new">
          <Button variant="primary">+ New Article</Button>
        </Link>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary, #F5F7FA)',
              marginBottom: '8px',
            }}
          >
            No articles yet
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary, #AAB5C4)',
              maxWidth: '460px',
              margin: '0 auto 24px',
            }}
          >
            Create your first canonical article in Markdown to begin distributing to DEV.to, Medium,
            Hashnode, or your ArtXFlow hosted publication.
          </p>
          <Link href="/articles/new">
            <Button size="md">+ Create First Article</Button>
          </Link>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {articles.map((article) => (
            <Card
              key={article.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link
                    href={`/articles/${article.id}`}
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #F5F7FA)',
                    }}
                  >
                    {article.title}
                  </Link>
                  <Badge
                    variant={
                      article.status === 'READY'
                        ? 'success'
                        : article.status === 'ARCHIVED'
                          ? 'default'
                          : 'warning'
                    }
                  >
                    {article.status}
                  </Badge>
                  {(() => {
                    const articlePubs = publicationsByArticle.get(article.id) || [];
                    const distStatus = calculateDistributionStatus(articlePubs);
                    if (distStatus === 'PARTIALLY_PUBLISHED') {
                      return <Badge variant="warning">Partially Published</Badge>;
                    }
                    return null;
                  })()}
                  {activeSchedulesByArticle.has(article.id) && (
                    <Badge variant="info">
                      ⏰ Scheduled (
                      {new Date(
                        activeSchedulesByArticle.get(article.id)!.scheduledAt,
                      ).toLocaleDateString()}
                      )
                    </Badge>
                  )}
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}
                >
                  <code style={{ color: 'var(--axf-cyan, #19D7FE)', fontSize: '12px' }}>
                    /{article.slug}
                  </code>
                  <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>
                    Updated {new Date(article.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link href={`/articles/${article.id}`}>
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
