import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { PublicationService } from '@artxflow/publishing';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, createDestinationSchema } from '@/lib/validation';

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

  const ctx = {
    userId: session.user.id,
    organizationId: organization.id,
  };

  const service = new PublicationService();
  const destinations = await service.listDestinations(ctx);

  return NextResponse.json({ destinations });
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

  const ctx = {
    userId: session.user.id,
    organizationId: organization.id,
  };

  try {
    const { data: body, error } = await parseJsonBody(request, createDestinationSchema);
    if (error) return error;

    const { type, name, siteId, connectionId, config } = body;

    const service = new PublicationService();
    const destination = await service.createDestination(ctx, {
      type,
      name,
      siteId,
      connectionId,
      config,
    });

    return NextResponse.json({ destination }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
