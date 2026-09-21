import { NextResponse } from 'next/server';
import { articleRepository, publicationRepository, destinationRepository } from '@artxflow/database';
import { authenticateApiKey, requireScope, forbiddenResponse } from '../../../../../../lib/api-key-auth';
import { isValidUuid } from '../../../../../../lib/is-valid-uuid';

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

  const publications = await publicationRepository.listByArticle(auth.organizationId, articleId);
  const destinations = await destinationRepository.listByOrganization(auth.organizationId);

  const destinationMap = new Map(destinations.map((d) => [d.id, d]));

  const platformMap: Record<string, { url: string | null; status: string; publishedAt: Date | null; name: string }> = {};

  for (const publication of publications) {
    if (!publication.externalUrl) continue;

    const destination = destinationMap.get(publication.destinationId);
    const destinationName = (destination?.name || publication.destinationId).toLowerCase();

    if (!platformMap[destinationName] || publication.publishedAt) {
      platformMap[destinationName] = {
        url: publication.externalUrl,
        status: publication.status,
        publishedAt: publication.publishedAt,
        name: destination?.name || destinationName,
      };
    }
  }

  return NextResponse.json({
    data: platformMap,
  });
}
