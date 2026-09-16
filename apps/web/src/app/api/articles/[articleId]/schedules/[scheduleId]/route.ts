import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  ScheduleArticleService,
  ScheduleNotFoundError,
  InvalidScheduleStateError,
  UnauthorizedTenantAccessError,
} from '@artxflow/publishing';

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ articleId: string; scheduleId: string }> },
) {
  const { scheduleId } = await props.params;
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
