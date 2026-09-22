import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { getStorageClient } from '@artxflow/storage';

interface RouteContext {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await context.params;
  const key = (params.key || []).join('/');

  if (!key) {
    return NextResponse.json({ error: 'Asset key missing' }, { status: 400 });
  }

  const storageClient = getStorageClient();
  if (typeof storageClient.get !== 'function') {
    return NextResponse.json({ error: 'Direct retrieval not supported' }, { status: 501 });
  }

  const assetData = await storageClient.get(key);
  if (!assetData) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  let contentType = assetData.contentType || 'application/octet-stream';
  if (!assetData.contentType) {
    const ext = key.split('.').pop()?.toLowerCase();
    if (ext === 'png') contentType = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'webp') contentType = 'image/webp';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'svg') contentType = 'image/svg+xml';
  }

  return new NextResponse(Buffer.from(assetData.data), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
