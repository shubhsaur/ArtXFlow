import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import sharp from 'sharp';
import { getSession } from '@artxflow/auth';
import { profileRepository } from '@artxflow/database';
import { getStorageClient } from '@artxflow/storage';

export const dynamic = 'force-dynamic';

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

function getAvatarStorageKey(userId: string): string {
  return `users/${userId}/avatar/profile`;
}

async function processAvatarImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toBuffer();
}

export async function POST(request: Request) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let imageUrl = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      imageUrl = body.imageUrl || '';
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file type '${file.type}'. Allowed types: JPEG, PNG, WebP, GIF, SVG.`,
          },
          { status: 400 },
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);
      const processedBuffer = await processAvatarImage(rawBuffer);

      const storageKey = getAvatarStorageKey(session.user.id);
      const storageClient = getStorageClient();

      imageUrl = await storageClient.upload(storageKey, processedBuffer, {
        contentType: 'image/webp',
        isPublic: true,
      });
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    await profileRepository.updateUserBasic(session.user.id, { image: imageUrl });

    return NextResponse.json({ ok: true, imageUrl });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update avatar' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const storageClient = getStorageClient();
    const storageKey = getAvatarStorageKey(session.user.id);

    try {
      await storageClient.delete(storageKey);
    } catch {
      // Ignore errors if the object does not exist.
    }

    await profileRepository.updateUserBasic(session.user.id, { image: null });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to remove avatar' },
      { status: 500 },
    );
  }
}
