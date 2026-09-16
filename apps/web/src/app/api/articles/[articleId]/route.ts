import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  articleService,
  ArticleNotFoundError,
  DuplicateSlugError,
  ValidationError,
  UnauthorizedOrganizationAccessError,
} from '@artxflow/content-core';

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
    if (error instanceof ArticleNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
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
    const body = await request.json();
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
    if (error instanceof ArticleNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof DuplicateSlugError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof UnauthorizedOrganizationAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
