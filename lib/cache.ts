/** Process-local TTL cache. Avoids re-running expensive/paid calls (LLM,
 * price lookups) for the same key within a warm server instance. Resets on
 * cold start — that's fine here, it just means the first hit after a
 * deploy/restart repopulates it. */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}
