import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { getStorageClient } from '@artxflow/storage';
import { assetRepository } from '@artxflow/database';
import { randomUUID } from 'node:crypto';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type '${file.type}'. Allowed types: JPEG, PNG, WebP, GIF, SVG.`,
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).` },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename and construct key
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `orgs/${organization.id}/images/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitizedName}`;

    const storageClient = getStorageClient();
    const publicUrl = await storageClient.upload(storageKey, buffer, {
      contentType: file.type,
      isPublic: true,
    });

    const asset = await assetRepository.create({
      organizationId: organization.id,
      type: 'IMAGE',
      storageKey,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      url: publicUrl,
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
