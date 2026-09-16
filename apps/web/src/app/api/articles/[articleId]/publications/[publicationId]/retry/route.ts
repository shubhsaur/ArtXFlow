import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  publicationService,
  PublicationNotFoundError,
  InvalidPublicationStateError,
  UnauthorizedTenantAccessError,
} from '@artxflow/publishing';

export async function POST(
  _request: Request,
  props: { params: Promise<{ articleId: string; publicationId: string }> },
) {
  const { publicationId } = await props.params;
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
    const publication = await publicationService.retryPublication(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      publicationId,
    );

    return NextResponse.json(publication, { status: 200 });
  } catch (error) {
    if (error instanceof PublicationNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof InvalidPublicationStateError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof UnauthorizedTenantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
