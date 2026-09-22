import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { ScheduleArticleService } from '@artxflow/publishing';
import { createInngestJobQueue } from '@artxflow/worker';
import { handleApiError } from '@/lib/handle-api-error';
import { scheduleArticleSchema } from '@/lib/validation';

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
      // handled by schema below
    }

    const parsed = scheduleArticleSchema.safeParse(rawBody);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Validation failed' },
        { status: 400 },
      );
    }
    const body = parsed.data;

    const queue = createInngestJobQueue();
    const service = new ScheduleArticleService({ jobQueue: queue });

    const schedule = await service.scheduleArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      {
        articleId,
        scheduledAt: body.scheduledAt,
        timezone: body.timezone,
        destinationIds: body.destinationIds,
        articleVersionId: body.articleVersionId,
        destinationOverrides: body.destinationOverrides,
      },
    );

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

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
    const service = new ScheduleArticleService();
    const schedules = await service.listSchedulesForArticle(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      articleId,
    );

    return NextResponse.json({ schedules }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, _props: { params: Promise<{ articleId: string }> }) {
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
    const url = new URL(request.url);
    let scheduleId = url.searchParams.get('scheduleId');

    if (!scheduleId) {
      try {
        const body = (await request.json()) as { scheduleId?: string };
        scheduleId = body.scheduleId || null;
      } catch {
        // searchParam fallback
      }
    }

    if (!scheduleId) {
      return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
    }

    const service = new ScheduleArticleService();
    const canceled = await service.cancelSchedule(
      {
        userId: session.user.id,
        organizationId: organization.id,
      },
      scheduleId,
    );

    return NextResponse.json(canceled, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
