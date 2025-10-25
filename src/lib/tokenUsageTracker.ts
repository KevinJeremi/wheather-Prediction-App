/**
 * Token Usage Tracker
 * Monitor penggunaan token Groq API untuk mencegah hitting limits
 * 
 * Free Tier Groq: 14,400 requests/day dengan unlimited tokens per request
 * Tapi praktiknya ada limit implisit (~1-2M tokens/hari)
 */

interface UsageStats {
    requests: number
    estimatedTokens: number
    timestamp: number
}

interface RequestTypeStats {
    [key: string]: {
        count: number
        totalTokens: number
        avgTokens: number
    }
}

export class TokenUsageTracker {
    private stats: UsageStats[] = []
    private requestStats: RequestTypeStats = {}
    private lastResetDate: string = this.getTodayDateString()

    // Thresholds
    private readonly ESTIMATED_DAILY_LIMIT = 1500000 // Conservative estimate
    private readonly WARNING_THRESHOLD = 0.7
    private readonly ERROR_THRESHOLD = 0.95

    /**
     * Track API usage
     */
    trackUsage(
        estimatedTokens: number,
        requestType: 'chat' | 'analysis' | 'summary' | 'recommendation' | 'trend' = 'chat'
    ): void {
        // Reset daily stats if new day
        const today = this.getTodayDateString()
        if (today !== this.lastResetDate) {
            this.reset()
            this.lastResetDate = today
        }

        const now = Date.now()

        // Add to overall stats
        this.stats.push({
            requests: 1,
            estimatedTokens,
            timestamp: now,
        })

        // Add to request type stats
        if (!this.requestStats[requestType]) {
            this.requestStats[requestType] = {
                count: 0,
                totalTokens: 0,
                avgTokens: 0,
            }
        }

        const typeStats = this.requestStats[requestType]
        typeStats.count++
        typeStats.totalTokens += estimatedTokens
        typeStats.avgTokens = Math.round(typeStats.totalTokens / typeStats.count)

        // Log usage
        this.logUsage(estimatedTokens, requestType)

        // Check thresholds
        this.checkThresholds()
    }

    /**
     * Get total usage untuk hari ini
     */
    getDailyUsage(): {
        requests: number
        estimatedTokens: number
        percentage: number
        status: 'good' | 'warning' | 'critical'
    } {
        const totalRequests = this.stats.reduce((sum, s) => sum + s.requests, 0)
        const totalTokens = this.stats.reduce((sum, s) => sum + s.estimatedTokens, 0)
        const percentage = (totalTokens / this.ESTIMATED_DAILY_LIMIT) * 100

        let status: 'good' | 'warning' | 'critical' = 'good'
        if (percentage >= this.ERROR_THRESHOLD * 100) {
            status = 'critical'
        } else if (percentage >= this.WARNING_THRESHOLD * 100) {
            status = 'warning'
        }

        return {
            requests: totalRequests,
            estimatedTokens: totalTokens,
            percentage: Math.round(percentage),
            status,
        }
    }

    /**
     * Get statistics per request type
     */
    getRequestTypeStats(): RequestTypeStats {
        return { ...this.requestStats }
    }

    /**
     * Get breakdown of usage
     */
    getUsageBreakdown(): {
        byType: {
            type: string
            count: number
            tokens: number
            percentage: string
        }[]
        total: number
    } {
        const totalTokens = this.stats.reduce((sum, s) => sum + s.estimatedTokens, 0)
        const byType = Object.entries(this.requestStats).map(([type, stats]) => ({
            type,
            count: stats.count,
            tokens: stats.totalTokens,
            percentage: totalTokens > 0
                ? ((stats.totalTokens / totalTokens) * 100).toFixed(1) + '%'
                : '0%',
        }))

        return {
            byType,
            total: totalTokens,
        }
    }

    /**
     * Get remaining budget
     */
    getRemaining(): {
        tokens: number
        percentage: number
        estimatedRequests: number
    } {
        const used = this.stats.reduce((sum, s) => sum + s.estimatedTokens, 0)
        const remaining = Math.max(0, this.ESTIMATED_DAILY_LIMIT - used)
        const avgTokensPerRequest = this.stats.length > 0
            ? Math.round(used / this.stats.length)
            : 256

        return {
            tokens: remaining,
            percentage: Math.round((remaining / this.ESTIMATED_DAILY_LIMIT) * 100),
            estimatedRequests: Math.floor(remaining / avgTokensPerRequest),
        }
    }

    /**
     * Reset daily stats
     */
    reset(): void {
        this.stats = []
        this.requestStats = {}
        console.log('📊 Daily token usage stats reset')
    }

    /**
     * Private: Log usage ke console
     */
    private logUsage(tokens: number, type: string): void {
        const usage = this.getDailyUsage()

        const emoji =
            usage.status === 'critical' ? '🔴' :
                usage.status === 'warning' ? '🟡' :
                    '🟢'

        console.log(
            `${emoji} [${type.toUpperCase()}] Tokens: ${tokens} | ` +
            `Daily: ${usage.estimatedTokens}/${this.ESTIMATED_DAILY_LIMIT} (${usage.percentage}%)`
        )
    }

    /**
     * Private: Check thresholds dan alert
     */
    private checkThresholds(): void {
        const usage = this.getDailyUsage()

        if (usage.status === 'critical') {
            console.error(
                `🚨 CRITICAL: Token usage at ${usage.percentage}%! ` +
                `Consider reducing request frequency or implementing caching.`
            )
        } else if (usage.status === 'warning') {
            console.warn(
                `⚠️ WARNING: Token usage at ${usage.percentage}%! ` +
                `Remaining: ~${this.getRemaining().estimatedRequests} requests today.`
            )
        }
    }

    /**
     * Private: Get today's date string
     */
    private getTodayDateString(): string {
        return new Date().toISOString().split('T')[0]
    }

    /**
     * Export stats ke JSON
     */
    exportStats(): {
        date: string
        daily: {
            requests: number
            estimatedTokens: number
            percentage: number
            status: 'good' | 'warning' | 'critical'
        }
        breakdown: {
            byType: {
                type: string
                count: number
                tokens: number
                percentage: string
            }[]
            total: number
        }
        remaining: {
            tokens: number
            percentage: number
            estimatedRequests: number
        }
    } {
        return {
            date: this.getTodayDateString(),
            daily: this.getDailyUsage(),
            breakdown: this.getUsageBreakdown(),
            remaining: this.getRemaining(),
        }
    }
}

/**
 * Global singleton instance
 */
export const tokenTracker = new TokenUsageTracker()

/**
 * Helper function untuk estimate token count
 * Rough estimate: 1 token ≈ 4 characters
 */
export function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4)
}

/**
 * Helper untuk middleware - track usage dari API calls
 */
export function createUsageTracking(requestType: 'chat' | 'analysis' | 'summary' | 'recommendation' | 'trend' = 'chat') {
    return {
        track: (estimatedTokens: number) => {
            tokenTracker.trackUsage(estimatedTokens, requestType)
        },
        getDailyUsage: () => tokenTracker.getDailyUsage(),
        getRemaining: () => tokenTracker.getRemaining(),
    }
}
