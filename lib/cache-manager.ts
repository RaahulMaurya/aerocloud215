/**
 * Cache Management System
 * Optimizes performance through intelligent caching
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // time to live in milliseconds
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Auto cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Delete all entries matching pattern
   */
  deletePattern(pattern: RegExp): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) => pattern.test(key))
    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }

  /**
   * Destroy cache manager and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Global cache instance
export const appCache = new CacheManager()

/**
 * Cache keys for common queries
 */
export const CACHE_KEYS = {
  // User files
  userFiles: (userId: string, folder: string) => `files:${userId}:${folder}`,
  userFolders: (userId: string) => `folders:${userId}`,

  // User stats
  userStorageStats: (userId: string) => `stats:storage:${userId}`,
  userUploadStats: (userId: string) => `stats:uploads:${userId}`,

  // Plans and pricing
  pricingPlans: "pricing:plans",
  storageQuotas: "quotas:storage",

  // Search and tags
  userSearch: (userId: string, query: string) => `search:${userId}:${query}`,
  userTags: (userId: string) => `tags:${userId}`,
}

/**
 * Invalidate cache for user when files change
 */
export function invalidateUserCache(userId: string): void {
  appCache.deletePattern(new RegExp(`^(files|folders|stats|search|tags):${userId}`))
}

/**
 * Invalidate specific folder cache
 */
export function invalidateFolderCache(userId: string, folder: string): void {
  appCache.deletePattern(new RegExp(`^files:${userId}:${folder}`))
}
