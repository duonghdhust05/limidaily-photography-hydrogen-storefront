/**
 * Idempotency Key Manager for Hydrogen Storefront BFF
 * Provides memory-safe in-memory caching with TTL expiration and in-flight concurrency locking.
 */

export interface IdempotencyEntry<T = unknown> {
  status: number;
  headers: Record<string, string>;
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface InFlightPromise<T = unknown> {
  promise: Promise<IdempotencyEntry<T>>;
  timestamp: number;
}

const DEFAULT_TTL_MS = 30_000; // 30 seconds
const MAX_ENTRIES = 1_000;

// Global in-memory stores (persists across requests within the worker/process lifecycle)
const cacheStore = new Map<string, IdempotencyEntry<unknown>>();
const inFlightStore = new Map<string, InFlightPromise<unknown>>();

/**
 * Generates a unique client-side idempotency key with high entropy.
 */
export function generateIdempotencyKey(prefix = 'idem'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Retrieves a cached idempotency record if it exists and has not expired.
 */
export function getIdempotencyRecord<T = unknown>(
  key: string,
): IdempotencyEntry<T> | null {
  if (!key) return null;

  const entry = cacheStore.get(key) as IdempotencyEntry<T> | undefined;
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry;
}

/**
 * Saves a completed response into the idempotency store with TTL.
 */
export function setIdempotencyRecord<T = unknown>(
  key: string,
  entry: {
    status?: number;
    headers?: Record<string, string>;
    data: T;
  },
  ttlMs = DEFAULT_TTL_MS,
): IdempotencyEntry<T> {
  if (!key) {
    return {
      status: entry.status ?? 200,
      headers: entry.headers ?? {},
      data: entry.data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
  }

  // Enforce max capacity by evicting oldest keys if limit reached
  if (cacheStore.size >= MAX_ENTRIES) {
    const oldestKey = cacheStore.keys().next().value;
    if (oldestKey) cacheStore.delete(oldestKey);
  }

  const record: IdempotencyEntry<T> = {
    status: entry.status ?? 200,
    headers: entry.headers ?? {},
    data: entry.data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  cacheStore.set(key, record as IdempotencyEntry<unknown>);
  inFlightStore.delete(key);

  return record;
}

/**
 * Checks if a request with the given idempotency key is currently executing.
 */
export function getInFlightPromise<T = unknown>(
  key: string,
): Promise<IdempotencyEntry<T>> | null {
  if (!key) return null;
  const inFlight = inFlightStore.get(key);
  if (!inFlight) return null;

  // If in-flight promise has been stuck for > 15s, prune it
  if (Date.now() - inFlight.timestamp > 15_000) {
    inFlightStore.delete(key);
    return null;
  }

  return inFlight.promise as Promise<IdempotencyEntry<T>>;
}

/**
 * Registers an in-flight promise to prevent concurrent duplicate execution.
 */
export function setInFlightPromise<T = unknown>(
  key: string,
  promise: Promise<IdempotencyEntry<T>>,
): void {
  if (!key) return;
  inFlightStore.set(key, {
    promise: promise as Promise<IdempotencyEntry<unknown>>,
    timestamp: Date.now(),
  });
}

/**
 * Removes an in-flight promise if execution failed or was aborted.
 */
export function clearInFlight(key: string): void {
  if (key) inFlightStore.delete(key);
}

/**
 * Housekeeping function to prune expired keys.
 */
export function pruneExpiredIdempotency(): number {
  const now = Date.now();
  let pruned = 0;
  for (const [key, entry] of cacheStore.entries()) {
    if (now > entry.expiresAt) {
      cacheStore.delete(key);
      pruned++;
    }
  }
  for (const [key, inFlight] of inFlightStore.entries()) {
    if (now - inFlight.timestamp > 15_000) {
      inFlightStore.delete(key);
      pruned++;
    }
  }
  return pruned;
}

/**
 * Resets the stores (primarily used for unit/integration tests).
 */
export function resetIdempotencyStore(): void {
  cacheStore.clear();
  inFlightStore.clear();
}
