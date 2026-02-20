/**
 * Simple in-memory rate limiter for serverless functions.
 * Limits requests per IP within a sliding window.
 *
 * Note: In-memory state resets on cold starts. For production scale,
 * upgrade to Vercel KV or Redis. This still protects against rapid-fire
 * abuse within a single function instance.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function checkRateLimit(ip: string, { maxRequests = 5, windowMs = 60 * 60 * 1000 } = {}): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = store.get(ip)

  // No entry or window expired — start fresh
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  // Within window — check count
  if (entry.count < maxRequests) {
    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
  }

  // Over limit
  return { allowed: false, remaining: 0, resetAt: entry.resetAt }
}
