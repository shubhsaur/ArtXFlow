import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { ScheduleArticleService } from '@artxflow/publishing';
import { handleApiError } from '@/lib/handle-api-error';

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
    return handleApiError(error);
  }
}
