import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@artxflow/database';

export async function GET() {
  const start = Date.now();
  let dbHealth: { ok: boolean; latencyMs?: number } = { ok: false };

  try {
    dbHealth = await checkDatabaseHealth();
  } catch {
    dbHealth = { ok: false };
  }

  const ok = dbHealth.ok;
  const status = ok ? 200 : 503;

  return NextResponse.json(
    {
      status: ok ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          ok: dbHealth.ok,
          latencyMs: dbHealth.latencyMs,
        },
      },
      responseMs: Date.now() - start,
    },
    { status },
  );
}
