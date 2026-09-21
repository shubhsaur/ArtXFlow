import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { userRepository } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'New email must be different from current email' }, { status: 400 });
  }

  // Check if email is already registered
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    return NextResponse.json({ error: 'This email is already registered with ArtXFlow' }, { status: 409 });
  }

  // Update email
  await userRepository.updateEmail(session.user.id, normalizedEmail);

  return NextResponse.json({ ok: true, email: normalizedEmail });
}
