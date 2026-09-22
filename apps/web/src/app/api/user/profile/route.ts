import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import {
  profileRepository,
  platformConnectionRepository,
} from '@artxflow/database';
import { handleApiError } from '@/lib/handle-api-error';
import { parseJsonBody, updateProfileSchema } from '@/lib/validation';

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
    const { data: body, error } = await parseJsonBody(request, updateProfileSchema);
    if (error) return error;

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
  } catch (error) {
    return handleApiError(error);
  }
}
