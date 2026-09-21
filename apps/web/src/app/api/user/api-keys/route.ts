import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { apiKeyRepository, generateApiKey } from '@artxflow/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await apiKeyRepository.listByUser(session.user.id);

  return NextResponse.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      scopes: k.scopes,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      revokedAt: k.revokedAt,
    })),
  });
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

  const body = await request.json().catch(() => ({}));
  const { name, scopes } = body;

  if (!name || !Array.isArray(scopes) || scopes.length === 0) {
    return NextResponse.json({ error: 'Name and scopes are required' }, { status: 400 });
  }

  const plaintextKey = generateApiKey();

  const record = await apiKeyRepository.create({
    userId: session.user.id,
    organizationId: organization.id,
    name,
    scopes,
    plaintextKey,
  });

  return NextResponse.json(
    {
      key: {
        id: record.id,
        name: record.name,
        keyPrefix: record.keyPrefix,
        scopes: record.scopes,
        createdAt: record.createdAt,
      },
      plaintextKey,
    },
    { status: 201 },
  );
}
