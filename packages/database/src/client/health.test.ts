import { describe, it, expect, vi } from 'vitest';
import { checkDatabaseHealth, type DbClient } from './index';
import { withTransaction } from '../transactions';
import { systemMeta } from '../schema';

describe('@artxflow/database', () => {
  describe('schema definition', () => {
    it('defines the systemMeta table with id, key, value, and updatedAt', () => {
      expect(systemMeta).toBeDefined();
      expect(systemMeta.id).toBeDefined();
      expect(systemMeta.key).toBeDefined();
      expect(systemMeta.value).toBeDefined();
      expect(systemMeta.updatedAt).toBeDefined();
    });
  });

  describe('checkDatabaseHealth', () => {
    it('returns ok: true and timestamp when execute succeeds', async () => {
      const mockDate = new Date('2026-09-13T00:00:00Z');
      const mockDb = {
        execute: vi.fn().mockResolvedValue([{ now: mockDate }]),
      } as unknown as DbClient;

      const result = await checkDatabaseHealth(mockDb);

      expect(result.ok).toBe(true);
      expect(result.timestamp).toEqual(mockDate);
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('propagates error when database execute fails', async () => {
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error('Connection lost')),
      } as unknown as DbClient;

      await expect(checkDatabaseHealth(mockDb)).rejects.toThrowError('Connection lost');
    });
  });

  describe('withTransaction', () => {
    it('invokes callback within a transaction boundary', async () => {
      const mockTx = { isTx: true };
      const mockDb = {
        transaction: vi.fn().mockImplementation(async (cb) => cb(mockTx)),
      } as unknown as DbClient;

      const result = await withTransaction(async (tx) => {
        expect(tx).toBe(mockTx);
        return 'transaction_success';
      }, mockDb);

      expect(result).toBe('transaction_success');
      expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    });
  });
});
