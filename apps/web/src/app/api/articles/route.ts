import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { articleService } from '@artxflow/content-core';
import { articleRepository } from '@artxflow/database';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, createArticleSchema } from '@/lib/validation';

export async function GET() {
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

  const articles = await articleRepository.listByOrganization(organization.id);
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
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
    const { data: body, error } = await parseJsonBody(request, createArticleSchema);
    if (error) return error;

    const result = await articleService.createArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        // Service-level validation rejects missing content with a 400 error.
        content: body.content as string,
        contentFormat: body.contentFormat,
        coverAssetId: body.coverAssetId ?? undefined,
        metadata: body.metadata,
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
