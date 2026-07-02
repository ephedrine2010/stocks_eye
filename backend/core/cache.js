// Tiny in-memory TTL cache. Keeps us under free-tier request caps.
// One instance, shared across services.

const store = new Map(); // key -> { value, expires }

export function get(key) {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expires) {
    store.delete(key);
    return undefined;
  }
  return hit.value;
}

export function set(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

// wrap(key, ttl, async fn) — return cached value or compute, cache, and return it.
export async function wrap(key, ttlMs, fn) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  return set(key, value, ttlMs);
}

export default { get, set, wrap };
