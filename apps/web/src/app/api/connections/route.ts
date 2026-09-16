import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { platformConnectionService } from '@artxflow/publishing';
import { devtoAdapter, PlatformError } from '@artxflow/platform-adapters';

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

    // Verify credentials and retrieve external author identity for DEV.to
    if (normalizedProvider === 'devto') {
      const profile = await devtoAdapter.verifyCredentials(secret.trim());
      accounts = [profile];
    }

    const result = await platformConnectionService.createConnection(ctx, {
      provider: normalizedProvider,
      secret: secret.trim(),
      tokenMetadata: tokenMetadata || {},
      accounts,
    });

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
