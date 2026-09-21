import { NextResponse } from 'next/server';
import { profileRepository } from '@artxflow/database';
import { authenticateApiKey, requireScope, forbiddenResponse } from '../../../../lib/api-key-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof Response) return auth;

  if (!requireScope(auth.scopes, 'profile:read')) {
    return forbiddenResponse();
  }

  const profile = await profileRepository.findByUserId(auth.userId);

  return NextResponse.json({
    data: {
      userId: auth.userId,
      organizationId: auth.organizationId,
      bio: profile?.bio || null,
      canonicalUrl: profile?.canonicalUrl || null,
      publicEmail: profile?.publicEmail || null,
      githubHandle: profile?.githubHandle || null,
      devtoHandle: profile?.devtoHandle || null,
      hashnodeHandle: profile?.hashnodeHandle || null,
      twitterHandle: profile?.twitterHandle || null,
    },
  });
}
