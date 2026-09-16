import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { PublicationService, InvalidDestinationConfigurationError } from '@artxflow/publishing';

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
    const body = await request.json();
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
    if (error instanceof InvalidDestinationConfigurationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
