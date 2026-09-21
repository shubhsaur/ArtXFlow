import { NextResponse } from 'next/server';
import { articleRepository } from '@artxflow/database';
import { authenticateApiKey, requireScope, forbiddenResponse } from '../../../../lib/api-key-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  if (!requireScope(auth.scopes, 'articles:read')) {
    return forbiddenResponse();
  }

  const articles = await articleRepository.listByOrganization(auth.organizationId);

  return NextResponse.json({
    data: articles.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    })),
  });
}
