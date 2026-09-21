import {describe, it, expect, beforeEach, vi} from 'vitest';
import {
  generateIdempotencyKey,
  getIdempotencyRecord,
  setIdempotencyRecord,
  getInFlightPromise,
  setInFlightPromise,
  clearInFlight,
  pruneExpiredIdempotency,
  resetIdempotencyStore,
} from '~/lib/idempotency';

describe('Idempotency Key Manager', () => {
  beforeEach(() => {
    resetIdempotencyStore();
  });

  describe('generateIdempotencyKey', () => {
    it('should generate distinct keys with prefix', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();

      expect(key1).toMatch(/^idem-[a-z0-9]+-[a-z0-9]+$/);
      expect(key2).toMatch(/^idem-[a-z0-9]+-[a-z0-9]+$/);
      expect(key1).not.toBe(key2);
    });

    it('should allow custom prefix', () => {
      const custom = generateIdempotencyKey('cart');
      expect(custom).toMatch(/^cart-[a-z0-9]+-[a-z0-9]+$/);
    });
  });

  describe('Record Storage & TTL Expiration', () => {
    it('should save and retrieve record within TTL', () => {
      const key = 'test-key-1';
      const data = {cartId: 'cart_123', linesCount: 1};

      setIdempotencyRecord(key, {status: 200, data}, 5_000);

      const record = getIdempotencyRecord<typeof data>(key);
      expect(record).not.toBeNull();
      expect(record?.status).toBe(200);
      expect(record?.data).toEqual(data);
    });

    it('should return null for non-existent key', () => {
      expect(getIdempotencyRecord('non-existent')).toBeNull();
      expect(getIdempotencyRecord('')).toBeNull();
    });

    it('should return null and prune expired records', () => {
      const key = 'expired-key';
      const data = {cartId: 'cart_exp'};

      setIdempotencyRecord(key, {status: 200, data}, 100);

      // Fast forward time past 100ms
      vi.setSystemTime(Date.now() + 200);

      expect(getIdempotencyRecord(key)).toBeNull();
      vi.useRealTimers();
    });

    it('should prune expired records via housekeeping function', () => {
      setIdempotencyRecord('key-1', {data: 1}, 50);
      setIdempotencyRecord('key-2', {data: 2}, 5_000);

      vi.setSystemTime(Date.now() + 100);

      const pruned = pruneExpiredIdempotency();
      expect(pruned).toBe(1);

      expect(getIdempotencyRecord('key-1')).toBeNull();
      expect(getIdempotencyRecord('key-2')).not.toBeNull();

      vi.useRealTimers();
    });
  });

  describe('In-Flight Concurrency Locking', () => {
    it('should track and resolve in-flight promises', async () => {
      const key = 'in-flight-key';
      let resolveFn: (entry: {status: number; headers: Record<string, string>; data: string; timestamp: number; expiresAt: number}) => void = () => {};
      const promise = new Promise<{status: number; headers: Record<string, string>; data: string; timestamp: number; expiresAt: number}>((resolve) => {
        resolveFn = resolve;
      });

      setInFlightPromise(key, promise);
      expect(getInFlightPromise(key)).toBe(promise);

      resolveFn({status: 200, headers: {}, data: 'ok', timestamp: Date.now(), expiresAt: Date.now() + 10_000});
      const resolved = await promise;
      setIdempotencyRecord(key, resolved);

      expect(getInFlightPromise(key)).toBeNull();
      expect(getIdempotencyRecord(key)?.data).toBe('ok');
    });

    it('should clear in-flight on failure', () => {
      const key = 'failing-key';
      const promise = Promise.reject(new Error('Boom')).catch(() => ({
        status: 500,
        headers: {},
        data: 'err',
        timestamp: Date.now(),
        expiresAt: Date.now() + 1000,
      }));

      setInFlightPromise(key, promise);
      clearInFlight(key);

      expect(getInFlightPromise(key)).toBeNull();
    });
  });
});
