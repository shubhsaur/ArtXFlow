import { NextResponse } from 'next/server';
import { articleRepository, articleVersionRepository } from '@artxflow/database';
import { authenticateApiKey, requireScope, forbiddenResponse } from '../../../../../lib/api-key-auth';
import { isValidUuid } from '../../../../../lib/is-valid-uuid';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await props.params;
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  if (!requireScope(auth.scopes, 'articles:read')) {
    return forbiddenResponse();
  }

  let article: Awaited<ReturnType<typeof articleRepository.findBySlug>> | null = null;

  if (isValidUuid(articleId)) {
    article = await articleRepository.findArticleForOrganization(auth.organizationId, articleId);
  }

  if (!article) {
    article = await articleRepository.findBySlug(auth.organizationId, articleId);
  }

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  let content: string | null = null;
  let contentFormat: string | null = null;

  if (requireScope(auth.scopes, 'articles:read:versions')) {
    const latestVersion = await articleVersionRepository.getLatestVersion(articleId);
    if (latestVersion) {
      content = latestVersion.content;
      contentFormat = latestVersion.contentFormat;
    }
  }

  return NextResponse.json({
    data: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      status: article.status,
      content,
      contentFormat,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    },
  });
}
