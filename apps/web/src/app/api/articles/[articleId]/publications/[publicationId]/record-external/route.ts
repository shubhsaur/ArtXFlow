import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { publicationService } from '@artxflow/publishing';
import { articleRepository } from '@artxflow/database';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, recordExternalPublicationSchema } from '@/lib/validation';

/**
 * Records an externally completed publication (e.g. executed via the ArtXFlow Chrome Extension).
 * Updates status to PUBLISHED with the live external URL and logs an audit event.
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ articleId: string; publicationId: string }> },
) {
  const { articleId, publicationId } = await props.params;
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organization } = await bootstrapPersonalOrganization({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });

  try {
    const { data: body, error } = await parseJsonBody(request, recordExternalPublicationSchema);
    if (error) return error;

    const ctx = {
      userId: session.user.id,
      organizationId: organization.id,
    };

    const updatedPub = await publicationService.updatePublicationStatus(ctx, {
      publicationId,
      status: 'PUBLISHED',
      externalUrl: body.externalUrl,
      externalResourceId: body.externalResourceId || body.externalUrl,
      publishedAt: new Date(),
    });

    // Mark article status as READY if currently in DRAFT
    const article = await articleRepository.findArticleForOrganization(organization.id, articleId);
    if (article && article.status === 'DRAFT') {
      await articleRepository.update(articleId, { status: 'READY' });
    }

    return NextResponse.json({ publication: updatedPub }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
