// Simple in-memory rate limiter (per IP)
// For production, use @upstash/ratelimit with Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits) {
    if (entry.resetAt < now) limits.delete(key);
  }
}, 60_000);

export function rateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Get client IP from request headers
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
