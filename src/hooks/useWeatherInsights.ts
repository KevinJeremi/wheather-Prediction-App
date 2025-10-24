'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CombinedWeatherData } from '@/types/weather.types'
import { generateDailyAISummary, generateWeatherAlerts } from '@/services/weatherAlertsService'
import type { WeatherAlert } from '@/services/weatherAlertsService'

interface UseWeatherInsightsReturn {
    summary: string | null
    alerts: WeatherAlert[]
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
    clearError: () => void
}

interface CachedInsights {
    summary: string | null
    alerts: WeatherAlert[]
    timestamp: number
    locationHash: string
}

/**
 * Generate hash dari location untuk cache key
 */
function generateLocationHash(location: string): string {
    return btoa(location).slice(0, 8)
}

/**
 * Get cache key untuk insights
 */
function getCacheKey(location: string): string {
    const hash = generateLocationHash(location)
    return `weather-insights-${hash}`
}

/**
 * Get cached insights jika masih valid (cache untuk 10 menit)
 */
function getCachedInsights(location: string): CachedInsights | null {
    try {
        const cacheKey = getCacheKey(location)
        const cached = localStorage.getItem(cacheKey)
        if (!cached) return null

        const data: CachedInsights = JSON.parse(cached)
        const now = Date.now()
        const cacheAge = now - data.timestamp

        // Cache valid selama 10 menit (600000ms)
        if (cacheAge < 600000) {
            return data
        }

        // Cache sudah expired, hapus dari localStorage
        localStorage.removeItem(cacheKey)
        return null
    } catch (err) {
        console.error('Error reading cached insights:', err)
        return null
    }
}

/**
 * Simpan insights ke localStorage
 */
function cacheInsights(location: string, insights: CachedInsights): void {
    try {
        const cacheKey = getCacheKey(location)
        localStorage.setItem(cacheKey, JSON.stringify(insights))
    } catch (err) {
        console.error('Error caching insights:', err)
    }
}

/**
 * Hook untuk generate AI summary dan alerts dari weather data
 * Menggunakan localStorage cache agar tidak reset saat perpindahan menu
 */
export function useWeatherInsights(
    weatherData: CombinedWeatherData | null,
    location: string | null
): UseWeatherInsightsReturn {
    const [summary, setSummary] = useState<string | null>(null)
    const [alerts, setAlerts] = useState<WeatherAlert[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateInsights = useCallback(async () => {
        if (!weatherData || !location) return

        // Check cache first
        const cached = getCachedInsights(location)
        if (cached) {
            setSummary(cached.summary)
            setAlerts(cached.alerts)
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Generate summary
            const summaryResult = await generateDailyAISummary(weatherData, location)
            setSummary(summaryResult)

            // Generate alerts
            const alertsResult = await generateWeatherAlerts(weatherData, location)
            setAlerts(alertsResult)

            // Cache the results
            cacheInsights(location, {
                summary: summaryResult,
                alerts: alertsResult,
                timestamp: Date.now(),
                locationHash: generateLocationHash(location)
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to generate insights'
            setError(message)
            console.error('Error generating weather insights:', err)
        } finally {
            setIsLoading(false)
        }
    }, [weatherData, location])

    useEffect(() => {
        generateInsights()
    }, [generateInsights])

    const refetch = useCallback(async () => {
        // Clear cache sebelum refetch
        if (location) {
            const cacheKey = getCacheKey(location)
            localStorage.removeItem(cacheKey)
        }
        await generateInsights()
    }, [generateInsights, location])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        summary,
        alerts,
        isLoading,
        error,
        refetch,
        clearError,
    }
}
