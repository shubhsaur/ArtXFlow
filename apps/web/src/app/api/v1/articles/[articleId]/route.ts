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

  let article: Awaited<ReturnType<typeof articleRepository.findWithCoverBySlug>> | null = null;

  if (isValidUuid(articleId)) {
    article = await articleRepository.findWithCoverForOrganization(auth.organizationId, articleId);
  }

  if (!article) {
    article = await articleRepository.findWithCoverBySlug(auth.organizationId, articleId);
  }

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  let content: string | null = null;
  let contentFormat: string | null = null;
  let metadataCoverUrl: string | null = null;

  if (requireScope(auth.scopes, 'articles:read:versions')) {
    const latestVersion = await articleVersionRepository.getLatestVersion(article.id);
    if (latestVersion) {
      content = latestVersion.content;
      contentFormat = latestVersion.contentFormat;
      if (
        latestVersion.metadata &&
        typeof latestVersion.metadata === 'object' &&
        'coverUrl' in latestVersion.metadata
      ) {
        metadataCoverUrl = (latestVersion.metadata as { coverUrl?: string }).coverUrl || null;
      }
    }
  }

  const coverImageUrl = article.coverImageUrl || metadataCoverUrl;

  return NextResponse.json({
    data: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      coverImageUrl,
      status: article.status,
      content,
      contentFormat,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    },
  });
}
