import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleService } from '@artxflow/content-core';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, updateArticleSchema } from '@/lib/validation';

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
    const result = await articleService.getArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      { articleId },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ articleId: string }> }) {
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
    const { data: body, error } = await parseJsonBody(request, updateArticleSchema);
    if (error) return error;

    const result = await articleService.updateArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      {
        articleId,
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        status: body.status,
        coverAssetId: body.coverAssetId,
        content: body.content,
        contentFormat: body.contentFormat,
        metadata: body.metadata,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
