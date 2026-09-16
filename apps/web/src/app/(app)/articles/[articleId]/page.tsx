import React from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { requireUser, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleService, ArticleNotFoundError } from '@artxflow/content-core';
import { ArticleEditor } from '../../../../components/article-editor';

export const dynamic = 'force-dynamic';

export default async function EditArticlePage(props: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await props.params;
  const headersList = await headers();
  const user = await requireUser(headersList);

  const { organization } = await bootstrapPersonalOrganization({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  try {
    const { article, version } = await articleService.getArticle(
      {
        userId: user.id,
        organizationId: organization.id,
      },
      { articleId },
    );

    return <ArticleEditor mode="edit" initialArticle={article} initialVersion={version} />;
  } catch (err) {
    if (err instanceof ArticleNotFoundError) {
      notFound();
    }
    throw err;
  }
}
