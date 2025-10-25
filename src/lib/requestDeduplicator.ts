/**
 * Request Deduplication & Debouncing Manager
 * Mencegah duplicate requests dan membatasi request frequency
 * 
 * Manfaat:
 * - Prevent duplicate requests yang terkirim simultan
 * - Debounce rapid user input (typing)
 * - Queue requests untuk rate limiting
 * - Reduce token usage drastis
 */

interface PendingRequest {
    key: string
    resolve: (value: any) => void
    reject: (error: any) => void
    timestamp: number
}

interface RequestConfig {
    debounceMs: number
    deduplicateMs: number
}

export class RequestDeduplicator {
    private pendingRequests = new Map<string, PendingRequest>()
    private requestCache = new Map<string, { result: any; timestamp: number }>()
    private debounceTimers = new Map<string, NodeJS.Timeout>()
    private readonly DEFAULT_DEBOUNCE = 800 // 800ms untuk user input
    private readonly DEFAULT_DEDUPLICATE = 2000 // 2 second window untuk deduplication
    private config: RequestConfig

    constructor(config: Partial<RequestConfig> = {}) {
        this.config = {
            debounceMs: config.debounceMs ?? this.DEFAULT_DEBOUNCE,
            deduplicateMs: config.deduplicateMs ?? this.DEFAULT_DEDUPLICATE,
        }
    }

    /**
     * Execute request dengan deduplication
     * Jika request yang sama sudah pending, tunggu hasilnya
     */
    async executeWithDedup<T>(
        key: string,
        executor: () => Promise<T>,
        options?: { debounce?: boolean; deduplicateMs?: number }
    ): Promise<T> {
        const deduplicateMs = options?.deduplicateMs ?? this.config.deduplicateMs
        const shouldDebounce = options?.debounce ?? true

        // Check if request is already pending
        if (this.pendingRequests.has(key)) {
            console.log(`⏳ [Dedup] Waiting for existing request: ${key}`)
            return new Promise((resolve, reject) => {
                const pending = this.pendingRequests.get(key)!
                const originalResolve = pending.resolve
                const originalReject = pending.reject

                pending.resolve = (value) => {
                    resolve(value)
                    originalResolve(value)
                }
                pending.reject = (error) => {
                    reject(error)
                    originalReject(error)
                }
            })
        }

        // Return pending promise
        return new Promise((resolve, reject) => {
            const executeRequest = async () => {
                try {
                    const result = await executor()
                    resolve(result)

                    // Store in cache for deduplication window
                    this.requestCache.set(key, {
                        result,
                        timestamp: Date.now() + deduplicateMs,
                    })

                    this.pendingRequests.delete(key)
                } catch (error) {
                    reject(error)
                    this.pendingRequests.delete(key)
                }
            }

            if (shouldDebounce) {
                // Cancel existing debounce timer
                if (this.debounceTimers.has(key)) {
                    clearTimeout(this.debounceTimers.get(key)!)
                }

                // Set new debounce timer
                const timer = setTimeout(() => {
                    executeRequest()
                    this.debounceTimers.delete(key)
                }, this.config.debounceMs)

                this.debounceTimers.set(key, timer)
            } else {
                executeRequest()
            }

            // Add to pending
            this.pendingRequests.set(key, {
                key,
                resolve,
                reject,
                timestamp: Date.now(),
            })
        })
    }

    /**
     * Clear debounce timers (e.g., when user submits)
     */
    flush(key?: string): void {
        if (key) {
            const timer = this.debounceTimers.get(key)
            if (timer) {
                clearTimeout(timer)
                this.debounceTimers.delete(key)
            }
        } else {
            this.debounceTimers.forEach(timer => clearTimeout(timer))
            this.debounceTimers.clear()
        }
    }

    /**
     * Get stats
     */
    getStats() {
        return {
            pendingRequests: this.pendingRequests.size,
            cachedRequests: this.requestCache.size,
            debouncedTimers: this.debounceTimers.size,
        }
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.requestCache.clear()
    }
}

export const requestDeduplicator = new RequestDeduplicator()

// ============================================================
// Request Queue untuk Rate Limiting
// ============================================================

export class RequestQueue {
    private queue: Array<() => Promise<any>> = []
    private isProcessing = false
    private readonly MAX_CONCURRENT = 1
    private readonly DELAY_BETWEEN_REQUESTS = 100 // 100ms between requests

    /**
     * Add request ke queue
     */
    async enqueue<T>(executor: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await executor()
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            })

            this.processQueue()
        })
    }

    /**
     * Process queue sequentially
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) return

        this.isProcessing = true

        while (this.queue.length > 0) {
            const request = this.queue.shift()
            if (request) {
                try {
                    await request()
                } catch (error) {
                    console.error('[RequestQueue] Error:', error)
                }
                // Wait before next request
                await new Promise(resolve => setTimeout(resolve, this.DELAY_BETWEEN_REQUESTS))
            }
        }

        this.isProcessing = false
    }

    /**
     * Get queue size
     */
    getQueueSize(): number {
        return this.queue.length
    }

    /**
     * Clear queue
     */
    clear(): void {
        this.queue = []
        this.isProcessing = false
    }
}

export const requestQueue = new RequestQueue()
