import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { env } from '@artxflow/config/server';
import * as schema from '../schema';

export type DatabaseSchema = typeof schema;
export type DbClient = PostgresJsDatabase<DatabaseSchema>;

export interface DatabaseHealthResult {
  ok: boolean;
  timestamp: Date;
  latencyMs?: number;
}

export function createDbClient(connectionString?: string): {
  db: DbClient;
  sqlClient: postgres.Sql;
} {
  const url = connectionString || env.DATABASE_URL;
  const sqlClient = postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  const db = drizzle(sqlClient, { schema });
  return { db, sqlClient };
}

let cachedDb: DbClient | null = null;
let cachedSqlClient: postgres.Sql | null = null;

export function getDb(): DbClient {
  if (!cachedDb) {
    const { db, sqlClient } = createDbClient();
    cachedDb = db;
    cachedSqlClient = sqlClient;
  }
  return cachedDb;
}

export async function closeDb(): Promise<void> {
  if (cachedSqlClient) {
    await cachedSqlClient.end();
    cachedSqlClient = null;
    cachedDb = null;
  }
}

export const db = new Proxy({} as DbClient, {
  get(_target, prop: string) {
    return getDb()[prop as keyof DbClient];
  },
});

export async function checkDatabaseHealth(dbInstance?: DbClient): Promise<DatabaseHealthResult> {
  const client = dbInstance || getDb();
  const start = Date.now();
  const result = await client.execute(sql`SELECT NOW() as now`);
  const latencyMs = Date.now() - start;

  const nowVal = (result as unknown as Array<{ now: Date | string }>)[0]?.now;
  return {
    ok: true,
    timestamp: nowVal ? new Date(nowVal) : new Date(),
    latencyMs,
  };
}
