import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { userRepository } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await userRepository.delete(session.user.id);

  return NextResponse.json({ ok: true });
}
