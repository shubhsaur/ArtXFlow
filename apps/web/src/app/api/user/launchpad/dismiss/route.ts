import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { profileRepository } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export async function POST() {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await profileRepository.dismissLaunchpad(session.user.id);
    return NextResponse.json({
      ok: true,
      message: 'Launchpad permanently dismissed for user account',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to dismiss launchpad' },
      { status: 500 },
    );
  }
}
