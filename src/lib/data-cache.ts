import { unstable_cache } from "next/cache";

/**
 * Wrap a Supabase read with Next.js's request cache. Subsequent navigations
 * within the TTL (60s) return the cached response — no DB round-trip.
 *
 * Use `revalidateTag(tag)` in mutation actions (approve / generate / etc.)
 * to bust the cache when data actually changes.
 */
export function cachedRead<T>(
  fn: () => Promise<T>,
  key: string[],
  tag: string,
  revalidateSeconds = 60
): () => Promise<T> {
  return unstable_cache(fn, key, {
    tags: [tag],
    revalidate: revalidateSeconds,
  });
}
