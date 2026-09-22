import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { apiKeyRepository, generateApiKey } from '@artxflow/database';
import { parseJsonBody, createApiKeySchema } from '@/lib/validation';

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

  const { data: body, error } = await parseJsonBody(request, createApiKeySchema);
  if (error) return error;

  const { name, scopes } = body;

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
