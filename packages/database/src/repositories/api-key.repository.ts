import { createHmac, randomBytes } from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../client';
import { apiKeys, ApiKey, NewApiKey } from '../schema/api-keys';

const API_KEY_SECRET = process.env.API_KEY_SECRET || '';

export const apiKeyRepository = {
  async create(input: Omit<NewApiKey, 'keyHash' | 'keyPrefix'> & { plaintextKey: string }) {
    const keyPrefix = input.plaintextKey.slice(0, 12);
    const keyHash = hashKey(input.plaintextKey);

    const [record] = await db
      .insert(apiKeys)
      .values({
        ...input,
        keyPrefix,
        keyHash,
      })
      .returning();

    return record;
  },

  async findById(id: string): Promise<ApiKey | undefined> {
    const [record] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return record;
  },

  async listByUser(userId: string): Promise<ApiKey[]> {
    return db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(apiKeys.createdAt);
  },

  async findValidKey(plaintextKey: string): Promise<ApiKey | undefined> {
    const keyPrefix = plaintextKey.slice(0, 12);
    const [record] = await db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.keyPrefix, keyPrefix),
          isNull(apiKeys.revokedAt),
        ),
      );

    if (!record) return undefined;

    const isValid = verifyKey(plaintextKey, record.keyHash);
    if (!isValid) return undefined;

    return record;
  },

  async revoke(id: string): Promise<ApiKey | undefined> {
    const [record] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date(), updatedAt: new Date() })
      .where(eq(apiKeys.id, id))
      .returning();

    return record;
  },

  async touchLastUsed(id: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
  },
};

function hashKey(key: string): string {
  return createHmac('sha256', API_KEY_SECRET).update(key).digest('hex');
}

function verifyKey(key: string, hash: string): boolean {
  return hashKey(key) === hash;
}

export function generateApiKey(): string {
  return `axf_${randomBytes(32).toString('hex')}`;
}
