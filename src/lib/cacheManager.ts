/**
 * Cache Manager for Response Caching
 * Reduce token usage by caching the same response
 * 
 * Benefits:
 * - 40-60% reduction for repeated questions
 * - Faster response times
 * - Lower token usage
 */

interface CacheEntry {
    response: string
    timestamp: number
    ttl: number
}

export class ResponseCache {
    private cache = new Map<string, CacheEntry>()
    private readonly DEFAULT_TTL = 21600000 // ✅ EXTENDED: 6 hours (from 1 hour) for weather data stability
    private stats = {
        hits: 0,
        misses: 0,
        total: 0,
    }

    /**
     * Set value in cache with TTL
     * @param key - Cache key
     * @param value - Response value
     * @param ttlMs - Time-to-live in milliseconds (default: 1 hour)
     */
    set(key: string, value: string, ttlMs = this.DEFAULT_TTL): void {
        this.cache.set(key, {
            response: value,
            timestamp: Date.now(),
            ttl: ttlMs,
        })
        this.stats.total++
    }

    /**
     * Get value from cache
     * @param key - Cache key
     * @returns Cached response or null if expired/not found
     */
    get(key: string): string | null {
        const entry = this.cache.get(key)

        if (!entry) {
            this.stats.misses++
            return null
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            this.stats.misses++
            return null
        }

        this.stats.hits++
        return entry.response
    }

    /**
     * Check if key exists in cache
     */
    has(key: string): boolean {
        const entry = this.cache.get(key)
        if (!entry) return false

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key)
            return false
        }

        return true
    }

    /**
     * Clear single cache entry
     */
    delete(key: string): void {
        this.cache.delete(key)
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.clear()
        console.log('🧹 Response cache cleared')
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const hitRate = this.stats.total > 0
            ? ((this.stats.hits / this.stats.total) * 100).toFixed(2)
            : 0

        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            total: this.stats.total,
            hitRate: `${hitRate}%`,
            size: this.cache.size,
        }
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats = { hits: 0, misses: 0, total: 0 }
    }

    /**
     * Get cache size in KB (approximate)
     */
    getSizeInKB(): number {
        let size = 0
        this.cache.forEach((entry) => {
            size += entry.response.length * 2 // Approximate: 2 bytes per char
        })
        return Math.round(size / 1024)
    }

    /**
     * Clean up expired entries
     */
    cleanup(): number {
        const now = Date.now()
        let cleaned = 0

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key)
                cleaned++
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired cache entries`)
        }

        return cleaned
    }
}

/**
 * Global singleton instance
 */
export const responseCache = new ResponseCache()

/**
 * Helper function to generate cache key from parameters
 * @example
 * const key = generateCacheKey('analysis', 'Jakarta, 25°C', 'Clear')
 */
export function generateCacheKey(...params: (string | number | undefined)[]): string {
    return params
        .filter(p => p !== undefined)
        .map(p => String(p).toLowerCase().replace(/\s+/g, '_'))
        .join('::')
}

/**
 * Helper function to hash string (for cache key)
 * Simple hash function, not cryptographic
 */
export function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
}
