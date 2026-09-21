import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  profileRepository,
  platformConnectionRepository,
} from '@artxflow/database';

export const dynamic = 'force-dynamic';

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

  const [fullProfile, securityData, connections] = await Promise.all([
    profileRepository.getFullUserProfile(session.user.id),
    profileRepository.getSecurityTelemetry(session.user.id),
    platformConnectionRepository.listByOrganization(organization.id),
  ]);

  if (!fullProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    profile: fullProfile,
    sso: {
      provider: securityData.ssoProvider,
      accountId: securityData.ssoAccountId,
      active: true,
      hasPassword: securityData.hasPassword,
    },
    connections: connections.map((c) => ({
      provider: c.provider,
      status: c.status,
    })),
  });
}

export async function PATCH(request: Request) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validation: Bio max 240 chars
    if (body.bio && typeof body.bio === 'string' && body.bio.length > 240) {
      return NextResponse.json(
        { error: 'Author bio must not exceed 240 characters.' },
        { status: 400 },
      );
    }

    // Validation: Canonical URL must be valid format if supplied
    if (body.canonicalUrl && typeof body.canonicalUrl === 'string') {
      try {
        new URL(body.canonicalUrl);
      } catch {
        return NextResponse.json(
          { error: 'Origin Blog URL must be a valid URL (e.g. https://yourdomain.dev)' },
          { status: 400 },
        );
      }
    }

    // Format username / slug
    let cleanUsername = body.username;
    if (typeof cleanUsername === 'string') {
      cleanUsername = cleanUsername.replace(/^@+/, '').trim().toLowerCase();
    }

    // Update basic user details if name changed
    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      await profileRepository.updateUserBasic(session.user.id, {
        name: body.name.trim(),
      });
    }

    // Persist extended profile data
    await profileRepository.upsert(session.user.id, {
      username: cleanUsername,
      jobTitle: body.jobTitle !== undefined ? body.jobTitle : undefined,
      canonicalUrl: body.canonicalUrl !== undefined ? body.canonicalUrl : undefined,
      bio: body.bio !== undefined ? body.bio : undefined,
      publicEmail: body.publicEmail !== undefined ? body.publicEmail : undefined,
      githubHandle: body.githubHandle !== undefined ? body.githubHandle : undefined,
      devtoHandle: body.devtoHandle !== undefined ? body.devtoHandle : undefined,
      hashnodeHandle: body.hashnodeHandle !== undefined ? body.hashnodeHandle : undefined,
      twitterHandle: body.twitterHandle !== undefined ? body.twitterHandle : undefined,
      notifySuccess: body.notifySuccess !== undefined ? Boolean(body.notifySuccess) : undefined,
      notifyFailure: body.notifyFailure !== undefined ? Boolean(body.notifyFailure) : undefined,
      notifyWeeklyDigest:
        body.notifyWeeklyDigest !== undefined ? Boolean(body.notifyWeeklyDigest) : undefined,
    });

    const updated = await profileRepository.getFullUserProfile(session.user.id);

    return NextResponse.json({
      ok: true,
      profile: updated,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update profile' },
      { status: 500 },
    );
  }
}
