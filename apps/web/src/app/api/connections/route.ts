import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  platformConnectionService,
  PublicationService,
  isHashnodePublishMode,
  DEFAULT_HASHNODE_PUBLISH_MODE,
  type HashnodePublishMode,
  isMediumPublishMode,
  DEFAULT_MEDIUM_PUBLISH_MODE,
  CLIENT_MANAGED_CONNECTION_SECRET,
  isClientManagedMediumPublish,
  type MediumPublishMode,
} from '@artxflow/publishing';
import { platformConnectionRepository } from '@artxflow/database';
import {
  devtoAdapter,
  mediumAdapter,
  hashnodeAdapter,
  PlatformError,
} from '@artxflow/platform-adapters';

function resolveIncomingHashnodePublishMode(body: {
  hashnodePublishMode?: unknown;
  tokenMetadata?: Record<string, unknown>;
}): HashnodePublishMode | { error: string } {
  const raw = body.hashnodePublishMode ?? body.tokenMetadata?.hashnodePublishMode;
  if (raw === undefined) {
    return DEFAULT_HASHNODE_PUBLISH_MODE;
  }
  if (!isHashnodePublishMode(raw)) {
    return {
      error: 'hashnodePublishMode must be one of: extension, hn_new, manual, api',
    };
  }
  return raw;
}

function resolveIncomingMediumPublishMode(body: {
  mediumPublishMode?: unknown;
  tokenMetadata?: Record<string, unknown>;
}): MediumPublishMode | { error: string } {
  const raw = body.mediumPublishMode ?? body.tokenMetadata?.mediumPublishMode;
  if (raw === undefined) {
    return DEFAULT_MEDIUM_PUBLISH_MODE;
  }
  if (!isMediumPublishMode(raw)) {
    return {
      error: 'mediumPublishMode must be one of: extension, medium_new, manual, api',
    };
  }
  return raw;
}

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

  const connectionsWithAccounts = await platformConnectionRepository.listWithAccountsByOrganization(
    organization.id,
  );

  return NextResponse.json({ connections: connectionsWithAccounts });
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
    const { provider, secret, tokenMetadata } = body as {
      provider?: unknown;
      secret?: unknown;
      tokenMetadata?: Record<string, unknown>;
      hashnodePublishMode?: unknown;
      mediumPublishMode?: unknown;
    };

    if (!provider || typeof provider !== 'string') {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const normalizedProvider = provider.toLowerCase().trim();
    const incomingMetadata: Record<string, unknown> = { ...(tokenMetadata || {}) };
    const providedSecret = typeof secret === 'string' ? secret.trim() : '';

    let mediumMode: MediumPublishMode | undefined;
    if (normalizedProvider === 'medium') {
      const mode = resolveIncomingMediumPublishMode(body);
      if (typeof mode === 'object' && 'error' in mode) {
        return NextResponse.json({ error: mode.error }, { status: 400 });
      }
      mediumMode = mode;
      incomingMetadata.mediumPublishMode = mode;
    }

    const mediumClientManaged = Boolean(
      mediumMode && isClientManagedMediumPublish(mediumMode),
    );
    const resolvedSecret =
      providedSecret ||
      (mediumClientManaged ? CLIENT_MANAGED_CONNECTION_SECRET : '');

    if (!resolvedSecret) {
      return NextResponse.json({ error: 'Secret/API key is required' }, { status: 400 });
    }

    let accounts: Array<{
      externalId: string;
      username: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      metadata?: Record<string, unknown>;
    }> = [];

    // Verify credentials and retrieve external author identity per platform
    if (normalizedProvider === 'devto') {
      const profile = await devtoAdapter.verifyCredentials(resolvedSecret);
      accounts = [profile];
    } else if (normalizedProvider === 'medium') {
      if (resolvedSecret !== CLIENT_MANAGED_CONNECTION_SECRET) {
        const profile = await mediumAdapter.verifyCredentials(resolvedSecret);
        accounts = [profile];
      } else {
        accounts = [
          {
            externalId: 'client-managed',
            username: 'medium',
            displayName: 'Medium (browser session)',
          },
        ];
        incomingMetadata.clientManaged = true;
      }
    } else if (normalizedProvider === 'hashnode') {
      const profile = await hashnodeAdapter.verifyCredentials(resolvedSecret);
      accounts = [
        {
          externalId: profile.externalId,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          metadata: {
            publications: profile.publications,
          },
        },
      ];
    }

    if (normalizedProvider === 'hashnode') {
      const mode = resolveIncomingHashnodePublishMode(body);
      if (typeof mode === 'object' && 'error' in mode) {
        return NextResponse.json({ error: mode.error }, { status: 400 });
      }
      incomingMetadata.hashnodePublishMode = mode;
    }

    const result = await platformConnectionService.createConnection(ctx, {
      provider: normalizedProvider,
      secret: resolvedSecret,
      tokenMetadata: incomingMetadata,
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

        const userTag =
          normalizedProvider === 'medium' && accounts[0]?.externalId === 'client-managed'
            ? ' (browser session)'
            : accounts[0]?.username
              ? ` (@${accounts[0].username})`
              : '';

        const destinationConfig: Record<string, unknown> = {
          ...incomingMetadata,
        };
        const hashnodePubId = (accounts[0]?.metadata?.publications as Array<{ id: string }>)?.[0]
          ?.id;
        if (normalizedProvider === 'hashnode' && hashnodePubId) {
          destinationConfig.publicationId = hashnodePubId;
        }
        if (
          normalizedProvider === 'medium' &&
          accounts[0]?.externalId &&
          accounts[0].externalId !== 'client-managed'
        ) {
          destinationConfig.authorId = accounts[0].externalId;
        }

        await pubService.createDestination(ctx, {
          type: normalizedProvider,
          name: `${providerLabel}${userTag}`,
          connectionId: result.connection.id,
          config: destinationConfig,
        });
      }
    } catch {
      // Non-blocking: destination can also be created via /api/destinations
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[POST /api/connections] Error:', error);
    if (error instanceof PlatformError) {
      const statusCode =
        error.statusCode && error.statusCode >= 400 && error.statusCode < 600
          ? error.statusCode
          : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status: statusCode });
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

export async function PATCH(request: Request) {
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
    const connectionId = typeof body.id === 'string' ? body.id : undefined;

    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID is required' }, { status: 400 });
    }

    const existing = await platformConnectionService.getConnection(ctx, connectionId);
    const metadataPatch: Record<string, unknown> =
      body.tokenMetadata &&
      typeof body.tokenMetadata === 'object' &&
      !Array.isArray(body.tokenMetadata)
        ? (body.tokenMetadata as Record<string, unknown>)
        : {};

    if (existing.provider.toLowerCase() === 'hashnode') {
      const rawMode = body.hashnodePublishMode ?? metadataPatch.hashnodePublishMode;
      if (rawMode !== undefined) {
        if (!isHashnodePublishMode(rawMode)) {
          return NextResponse.json(
            {
              error: 'hashnodePublishMode must be one of: extension, hn_new, manual, api',
            },
            { status: 400 },
          );
        }
        metadataPatch.hashnodePublishMode = rawMode;
      }
    }

    if (existing.provider.toLowerCase() === 'medium') {
      const rawMode = body.mediumPublishMode ?? metadataPatch.mediumPublishMode;
      if (rawMode !== undefined) {
        if (!isMediumPublishMode(rawMode)) {
          return NextResponse.json(
            {
              error: 'mediumPublishMode must be one of: extension, medium_new, manual, api',
            },
            { status: 400 },
          );
        }
        metadataPatch.mediumPublishMode = rawMode;
      }
    }

    if (Object.keys(metadataPatch).length === 0) {
      return NextResponse.json({ error: 'No connection preferences to update' }, { status: 400 });
    }

    const connection = await platformConnectionService.updateTokenMetadata(ctx, connectionId, {
      tokenMetadata: metadataPatch,
    });

    const syncedModeKey =
      existing.provider.toLowerCase() === 'hashnode'
        ? 'hashnodePublishMode'
        : existing.provider.toLowerCase() === 'medium'
          ? 'mediumPublishMode'
          : null;

    if (syncedModeKey && typeof metadataPatch[syncedModeKey] === 'string') {
      try {
        const pubService = new PublicationService();
        const destinations = await pubService.listDestinations(ctx);
        const matchingDest = destinations.find((d) => d.connectionId === connectionId);
        if (matchingDest) {
          await pubService.updateDestination(ctx, matchingDest.id, {
            config: { [syncedModeKey]: metadataPatch[syncedModeKey] },
          });
        }
      } catch {
        // Preference is stored on the connection even if destination sync fails.
      }
    }

    return NextResponse.json({ connection });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
