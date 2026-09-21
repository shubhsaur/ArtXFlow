import { NextResponse } from 'next/server';
import { articleRepository, publicationRepository } from '@artxflow/database';
import { authenticateApiKey, requireScope, forbiddenResponse } from '../../../../../../lib/api-key-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ articleId: string }> },
) {
  const { articleId } = await props.params;
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  if (!requireScope(auth.scopes, 'articles:read:publications')) {
    return forbiddenResponse();
  }

  const article = await articleRepository.findArticleForOrganization(auth.organizationId, articleId);

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  const publications = await publicationRepository.listByArticle(auth.organizationId, articleId);

  const platformMap: Record<string, { url: string | null; status: string; publishedAt: Date | null }> = {};

  for (const publication of publications) {
    if (!publication.externalUrl) continue;

    const destinationName = publication.destinationId.toLowerCase();

    if (!platformMap[destinationName] || publication.publishedAt) {
      platformMap[destinationName] = {
        url: publication.externalUrl,
        status: publication.status,
        publishedAt: publication.publishedAt,
      };
    }
  }

  return NextResponse.json({
    data: platformMap,
  });
}
