import 'server-only'

// Simple in-memory rate limiter per user. Resets per minute window.
// Suitable for a single-process deployment; for multi-instance use Supabase-based counting.
const LIMIT = 5 // generations per minute per user
const WINDOW_MS = 60_000

const store = new Map<string, { count: number; windowStart: number }>()

export function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(userId, { count: 1, windowStart: now })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= LIMIT) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart)
    return { allowed: false, retryAfterMs }
  }

  entry.count++
  return { allowed: true, retryAfterMs: 0 }
}
