import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { platformConnectionService, PublicationService } from '@artxflow/publishing';
import {
  devtoAdapter,
  mediumAdapter,
  hashnodeAdapter,
  PlatformError,
} from '@artxflow/platform-adapters';

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

  const connections = await platformConnectionService.listConnections(ctx);
  return NextResponse.json({ connections });
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
    const { provider, secret, tokenMetadata } = body;

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json({ error: 'Secret/API key is required' }, { status: 400 });
    }

    const normalizedProvider = provider.toLowerCase().trim();
    let accounts: Array<{
      externalId: string;
      username: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      metadata?: Record<string, unknown>;
    }> = [];

    // Verify credentials and retrieve external author identity per platform
    if (normalizedProvider === 'devto') {
      const profile = await devtoAdapter.verifyCredentials(secret.trim());
      accounts = [profile];
    } else if (normalizedProvider === 'medium') {
      const profile = await mediumAdapter.verifyCredentials(secret.trim());
      accounts = [profile];
    } else if (normalizedProvider === 'hashnode') {
      const profile = await hashnodeAdapter.verifyCredentials(secret.trim());
      accounts = [profile];
    }

    const result = await platformConnectionService.createConnection(ctx, {
      provider: normalizedProvider,
      secret: secret.trim(),
      tokenMetadata: tokenMetadata || {},
      accounts,
    });

    // Ensure corresponding publishing destination is registered (best-effort)
    try {
      const pubService = new PublicationService();
      const existingDestinations = await pubService.listDestinations(ctx);
      const hasDestination = existingDestinations.some(
        (d) => d.connectionId === result.connection.id,
      );

      if (!hasDestination) {
        const providerLabel =
          normalizedProvider === 'devto'
            ? 'DEV.to'
            : normalizedProvider === 'medium'
              ? 'Medium'
              : normalizedProvider === 'hashnode'
                ? 'Hashnode'
                : normalizedProvider;

        const userTag = accounts[0]?.username ? ` (@${accounts[0].username})` : '';

        await pubService.createDestination(ctx, {
          type: normalizedProvider,
          name: `${providerLabel}${userTag}`,
          connectionId: result.connection.id,
          config: tokenMetadata || {},
        });
      }
    } catch {
      // Non-blocking: destination can also be created via /api/destinations
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof PlatformError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode || 400 },
      );
    }

    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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

  const url = new URL(request.url);
  const connectionId = url.searchParams.get('id');

  if (!connectionId) {
    return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
  }

  try {
    await platformConnectionService.deleteConnection(ctx, connectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
