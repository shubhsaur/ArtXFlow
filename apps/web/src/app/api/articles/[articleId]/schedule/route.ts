import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  ScheduleArticleService,
  ArticleNotFoundError,
  ArticleNotPublishableError,
  InvalidDestinationConfigurationError,
  UnauthorizedTenantAccessError,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
  InvalidTimezoneError,
  PastScheduledTimeError,
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
    const body = (await request.json()) as {
      scheduledAt?: string;
      timezone?: string;
      destinationIds?: string[];
      articleVersionId?: string;
      destinationOverrides?: Record<string, DestinationOverrides>;
    };

    if (!body.scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt is required' }, { status: 400 });
    }

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
    if (error instanceof ArticleNotFoundError || error instanceof ScheduleNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (
      error instanceof ArticleNotPublishableError ||
      error instanceof PastScheduledTimeError ||
      error instanceof InvalidTimezoneError ||
      error instanceof InvalidScheduleStateError
    ) {
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
    if (error instanceof UnauthorizedTenantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
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
    if (error instanceof ScheduleNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof InvalidScheduleStateError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error instanceof UnauthorizedTenantAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
