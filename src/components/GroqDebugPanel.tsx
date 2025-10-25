/**
 * Debug Component untuk Test Groq Optimization
 * 
 * Gunakan untuk memverifikasi:
 * - Token tracking berfungsi
 * - Caching berfungsi
 * - Request deduplication berfungsi
 * - Debouncing berfungsi
 */

'use client'

import { useState, useEffect } from 'react'
import {
    getAllMonitoringData,
    getModelInfo,
    getDetailedStats,
    getCacheStats
} from '@/services/groqService'

export function GroqDebugPanel() {
    const [stats, setStats] = useState<any>(null)
    const [modelInfo, setModelInfo] = useState<any>(null)
    const [refreshTime, setRefreshTime] = useState(new Date())

    useEffect(() => {
        // Refresh stats every 2 seconds
        const interval = setInterval(() => {
            setStats(getAllMonitoringData())
            setModelInfo(getModelInfo())
            setRefreshTime(new Date())
        }, 2000)

        // Initial fetch
        setStats(getAllMonitoringData())
        setModelInfo(getModelInfo())

        return () => clearInterval(interval)
    }, [])

    if (!stats || !modelInfo) return null

    const tokenUsage = stats.tokenUsage
    const cacheStats = stats.cacheStats
    const remaining = stats.remaining

    const getStatusEmoji = (percentage: number) => {
        if (percentage >= 95) return '🔴'
        if (percentage >= 70) return '🟡'
        return '🟢'
    }

    const statusEmoji = getStatusEmoji(tokenUsage.percentage)

    return (
        <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 text-sm z-50">
            {/* Header */}
            <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">
                    {statusEmoji} Groq API Monitor
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Updated: {refreshTime.toLocaleTimeString()}
                </p>
            </div>

            {/* Token Usage */}
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Token Usage
                </h4>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Requests Today:</span>
                        <span className="font-mono">{tokenUsage.requests}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tokens Used:</span>
                        <span className="font-mono">{tokenUsage.estimatedTokens?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-semibold ${tokenUsage.status === 'good' ? 'text-green-600' :
                                tokenUsage.status === 'warning' ? 'text-yellow-600' :
                                    'text-red-600'
                            }`}>
                            {tokenUsage.percentage}%
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                            className={`h-full transition-all ${tokenUsage.status === 'good' ? 'bg-green-500' :
                                    tokenUsage.status === 'warning' ? 'bg-yellow-500' :
                                        'bg-red-500'
                                }`}
                            style={{ width: `${tokenUsage.percentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Remaining Budget */}
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Remaining Budget
                </h4>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Tokens Left:</span>
                        <span className="font-mono">{remaining.tokens?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Est. Requests:</span>
                        <span className="font-mono">{remaining.estimatedRequests || 0}</span>
                    </div>
                </div>
            </div>

            {/* Cache Stats */}
            <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Cache Performance
                </h4>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span>Hit Rate:</span>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {cacheStats.hitRate}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Cache Size:</span>
                        <span className="font-mono">{cacheStats.size} entries</span>
                    </div>
                </div>
            </div>

            {/* Model Info */}
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <div className="flex justify-between mb-1">
                    <span>Model:</span>
                    <span className="font-mono">{modelInfo.model}</span>
                </div>
                <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="font-mono">{modelInfo.provider}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
                <button
                    onClick={() => {
                        setStats(getAllMonitoringData())
                        setRefreshTime(new Date())
                    }}
                    className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                >
                    Refresh
                </button>
                <button
                    onClick={() => {
                        const data = getDetailedStats()
                        console.log('Detailed Stats:', data)
                        alert('Check console for detailed stats')
                    }}
                    className="flex-1 px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                >
                    Details
                </button>
            </div>
        </div>
    )
}

export default GroqDebugPanel
