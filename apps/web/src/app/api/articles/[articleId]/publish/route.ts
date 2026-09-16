import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  PublishArticleService,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
  UnauthorizedTenantAccessError,
} from '@artxflow/publishing';
import { createInngestJobQueue } from '@artxflow/worker';

import type { DestinationOverrides } from '@artxflow/types';

export async function POST(request: Request, props: { params: Promise<{ articleId: string }> }) {
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
    let body: {
      destinationIds?: string[];
      articleVersionId?: string;
      destinationOverrides?: Record<string, DestinationOverrides>;
    } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    // Connect to durable Inngest-backed workflow queue
    const queue = createInngestJobQueue();
    const service = new PublishArticleService({ jobQueue: queue });

    const result = await service.publishArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      {
        articleId,
        destinationIds: body.destinationIds,
        articleVersionId: body.articleVersionId,
        destinationOverrides: body.destinationOverrides,
      },
    );

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    if (error instanceof ArticleNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ArticleNotPublishableError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof InvalidDestinationConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof UnauthorizedTenantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
