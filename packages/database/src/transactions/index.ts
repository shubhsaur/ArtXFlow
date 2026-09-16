import type { DbClient } from '../client';
import { getDb } from '../client';

export type Transaction = Parameters<Parameters<DbClient['transaction']>[0]>[0];

export async function withTransaction<T>(
  callback: (tx: Transaction) => Promise<T>,
  dbInstance?: DbClient,
): Promise<T> {
  const client = dbInstance || getDb();
  return client.transaction(async (tx) => {
    return callback(tx);
  });
}
