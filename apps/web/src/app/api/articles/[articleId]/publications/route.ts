import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { publicationService } from '@artxflow/publishing';
import { handleApiError } from '@/lib/handle-api-error';

export async function GET(_request: Request, props: { params: Promise<{ articleId: string }> }) {
  const { articleId } = await props.params;
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
    const publications = await publicationService.listPublicationsForArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      articleId,
    );

    return NextResponse.json({ publications });
  } catch (error) {
    return handleApiError(error);
  }
}
