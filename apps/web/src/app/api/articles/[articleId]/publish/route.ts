import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { PublishArticleService } from '@artxflow/publishing';
import { createInngestJobQueue } from '@artxflow/worker';
import { handleApiError } from '@/lib/handle-api-error';
import { publishArticleSchema } from '@/lib/validation';

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
    let rawBody: unknown = {};
    try {
      rawBody = await request.json();
    } catch {
      // Body is optional
    }

    const parsed = publishArticleSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues.map((i) => i.message) },
        { status: 400 },
      );
    }
    const body = parsed.data;

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
    return handleApiError(error);
  }
}
