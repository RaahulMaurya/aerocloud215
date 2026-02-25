/**
 * Rate Limiting System for Production
 * Prevents abuse and ensures fair resource usage
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // in milliseconds
  keyPrefix: string
}

const DEFAULT_UPLOAD_LIMIT: RateLimitConfig = {
  maxRequests: 100, // 100 uploads per user
  windowMs: 3600000, // per hour
  keyPrefix: "ratelimit:upload:",
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Check if a request is within rate limit
 */
export function checkRateLimit(userId: string, config: RateLimitConfig = DEFAULT_UPLOAD_LIMIT): boolean {
  const key = config.keyPrefix + userId
  const now = Date.now()

  let limitData = rateLimitStore.get(key)

  if (!limitData || now > limitData.resetTime) {
    // Reset if window expired
    limitData = {
      count: 0,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, limitData)
  }

  if (limitData.count >= config.maxRequests) {
    return false
  }

  limitData.count++
  return true
}

/**
 * Get remaining requests in current window
 */
export function getRemainingRequests(userId: string, config: RateLimitConfig = DEFAULT_UPLOAD_LIMIT): number {
  const key = config.keyPrefix + userId
  const limitData = rateLimitStore.get(key)

  if (!limitData || Date.now() > limitData.resetTime) {
    return config.maxRequests
  }

  return Math.max(0, config.maxRequests - limitData.count)
}

/**
 * Get reset time for current rate limit window
 */
export function getRateLimitReset(userId: string, config: RateLimitConfig = DEFAULT_UPLOAD_LIMIT): number {
  const key = config.keyPrefix + userId
  const limitData = rateLimitStore.get(key)

  if (!limitData) {
    return Date.now() + config.windowMs
  }

  return limitData.resetTime
}

/**
 * Clear rate limit for a user (admin function)
 */
export function clearRateLimit(userId: string): void {
  const keys = Array.from(rateLimitStore.keys()).filter((k) => k.includes(userId))
  keys.forEach((key) => rateLimitStore.delete(key))
}

/**
 * Validate upload quota for user
 */
export function validateUploadQuota(
  currentStorageUsed: number,
  fileSize: number,
  maxStorage: number,
  uploadCount: number,
  maxUploadsPerMonth: number,
): { valid: boolean; reason?: string } {
  // Check storage quota
  if (currentStorageUsed + fileSize > maxStorage) {
    return { valid: false, reason: "Storage quota exceeded" }
  }

  // Check upload count quota
  if (uploadCount >= maxUploadsPerMonth) {
    return { valid: false, reason: "Monthly upload limit exceeded" }
  }

  return { valid: true }
}
