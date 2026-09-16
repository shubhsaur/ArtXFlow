import React from 'react';
import { headers } from 'next/headers';
import { requireUser } from '@artxflow/auth';
import { ArticleEditor } from '../../../../components/article-editor';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const headersList = await headers();
  await requireUser(headersList);

  return <ArticleEditor mode="create" />;
}
