import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { apiKeyRepository } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ keyId: string }> },
) {
  const { keyId } = await props.params;
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = await apiKeyRepository.findById(keyId);

  if (!key || key.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await apiKeyRepository.revoke(keyId);

  return NextResponse.json({ ok: true });
}
