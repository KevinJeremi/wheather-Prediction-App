/**
 * Custom Hook: useAI
 * Simplified interface for Groq API
 * With built-in state management and error handling
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
    getWeatherAnalysis,
    getDailySummary,
    chat,
    generateWeatherRecommendations,
    analyzeWeatherTrend,
} from '@/services/groqService'
import { requestDeduplicator } from '@/lib/requestDeduplicator'
import type {
    AIResponse,
    AIMessage,
    ConversationHistory,
    WeatherAnalysisContext,
} from '@/types/ai.types'

// Simple hash function untuk cache key
function hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash).toString(36)
}

// ============================================================
// Hook Type Definitions
// ============================================================

interface UseAIState {
    isLoading: boolean
    error: string | null
    response: string | null
    messageCount: number
    conversationMemory: number  // Track conversation memory size
}

interface UseAICallbacks {
    analyzeWeather: (context: string, question?: string) => Promise<void>
    getDailySummary: (location: string, current: string, forecast: string) => Promise<void>
    chat: (message: string) => Promise<void>
    getRecommendations: (condition: string, context?: string) => Promise<void>
    analyzeTrend: (predictions: any[]) => Promise<void>
    clearHistory: () => void
    clearError: () => void
}

// ============================================================
// Main Hook
// ============================================================

export function useAI() {
    // State management with enhanced memory tracking
    const [state, setState] = useState<UseAIState>({
        isLoading: false,
        error: null,
        response: null,
        messageCount: 0,
        conversationMemory: 0,
    })

    // Conversation history - dengan memory limit
    const conversationHistoryRef = useRef<ConversationHistory>([])
    const MAX_CONVERSATION_HISTORY = 10  // ✅ Balanced: Keep 5 exchanges for better context, ~2KB memory

    // ========================================================
    // Helper Functions
    // ========================================================

    const setLoading = useCallback((isLoading: boolean) => {
        setState((prev) => ({ ...prev, isLoading, error: null }))
    }, [])

    const setResponse = useCallback((response: string, addToHistory = false) => {
        setState((prev) => ({
            ...prev,
            response,
            isLoading: false,
            messageCount: prev.messageCount + 1,
        }))

        if (addToHistory) {
            conversationHistoryRef.current.push({
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString(),
            })
        }
    }, [])

    const setError = useCallback((error: string) => {
        setState((prev) => ({
            ...prev,
            error,
            isLoading: false,
        }))
    }, [])

    const addToHistory = useCallback((role: 'user' | 'assistant', content: string) => {
        conversationHistoryRef.current.push({
            role,
            content,
            timestamp: new Date().toISOString(),
        })

        // Keep conversation memory within limit (FIFO - remove oldest if exceeded)
        if (conversationHistoryRef.current.length > MAX_CONVERSATION_HISTORY) {
            conversationHistoryRef.current = conversationHistoryRef.current.slice(-MAX_CONVERSATION_HISTORY)
        }

        // Update memory tracking
        setState(prev => ({
            ...prev,
            conversationMemory: conversationHistoryRef.current.length
        }))
    }, [])

    // ========================================================
    // API Call Functions
    // ========================================================

    const analyzeWeatherHandler = useCallback(
        async (context: string, question?: string) => {
            setLoading(true)
            try {
                const result = await getWeatherAnalysis(context, question)

                if (!result.success || !result.content) {
                    throw new Error(result.error?.message || 'Analisis cuaca gagal')
                }

                addToHistory('user', question || `Konteks: ${context}`)
                setResponse(result.content, true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
                setError(message)
            }
        },
        [setLoading, setResponse, setError, addToHistory]
    )

    const getDailySummaryHandler = useCallback(
        async (location: string, current: string, forecast: string) => {
            setLoading(true)
            try {
                const result = await getDailySummary(location, current, forecast)

                if (!result.success || !result.content) {
                    throw new Error(result.error?.message || 'Ringkasan harian gagal')
                }

                addToHistory('user', `Ringkasan harian untuk ${location}`)
                setResponse(result.content, true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
                setError(message)
            }
        },
        [setLoading, setResponse, setError, addToHistory]
    )

    const chatHandler = useCallback(
        async (message: string) => {
            setLoading(true)
            try {
                addToHistory('user', message)

                // ✅ Use deduplication with debouncing to prevent duplicate requests
                const cacheKey = `chat_${hashString(message)}_${conversationHistoryRef.current.length}`
                const result = await requestDeduplicator.executeWithDedup(
                    cacheKey,
                    () => chat(message, conversationHistoryRef.current),
                    { debounce: true } // 800ms debounce
                )

                if (!result.success || !result.content) {
                    throw new Error(result.error?.message || 'Chat failed')
                }

                setResponse(result.content, true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An error occurred'
                setError(message)
            }
        },
        [setLoading, setResponse, setError, addToHistory]
    )

    const getRecommendationsHandler = useCallback(
        async (condition: string, context?: string) => {
            setLoading(true)
            try {
                const result = await generateWeatherRecommendations(condition, context)

                if (!result.success || !result.content) {
                    throw new Error(result.error?.message || 'Recommendations failed')
                }

                addToHistory('user', `Recommendations for: ${condition}`)
                setResponse(result.content, true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An error occurred'
                setError(message)
            }
        },
        [setLoading, setResponse, setError, addToHistory]
    )

    const analyzeTrendHandler = useCallback(
        async (predictions: any[]) => {
            setLoading(true)
            try {
                const result = await analyzeWeatherTrend(predictions)

                if (!result.success || !result.content) {
                    throw new Error(result.error?.message || 'Trend analysis failed')
                }

                addToHistory('user', 'Weather trend analysis')
                setResponse(result.content, true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An error occurred'
                setError(message)
            }
        },
        [setLoading, setResponse, setError, addToHistory]
    )

    const clearHistory = useCallback(() => {
        conversationHistoryRef.current = []
        setState({
            isLoading: false,
            error: null,
            response: null,
            messageCount: 0,
            conversationMemory: 0,
        })
    }, [])

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }))
    }, [])

    // ========================================================
    // Return Object
    // ========================================================

    const callbacks: UseAICallbacks = {
        analyzeWeather: analyzeWeatherHandler,
        getDailySummary: getDailySummaryHandler,
        chat: chatHandler,
        getRecommendations: getRecommendationsHandler,
        analyzeTrend: analyzeTrendHandler,
        clearHistory,
        clearError,
    }

    return {
        ...state,
        ...callbacks,
        conversationHistory: conversationHistoryRef.current,
    }
}

// ============================================================
// Specialized Hooks
// ============================================================

/**
 * Hook untuk chatting dengan AI
 */
export function useAIChat() {
    const ai = useAI()
    const historyRef = useRef<ConversationHistory>([])

    const sendMessage = useCallback(
        async (message: string) => {
            historyRef.current.push({
                role: 'user',
                content: message,
            })
            await ai.chat(message)
        },
        [ai]
    )

    return {
        isLoading: ai.isLoading,
        error: ai.error,
        response: ai.response,
        sendMessage,
        clearHistory: ai.clearHistory,
    }
}

/**
 * Hook untuk weather analysis
 */
export function useWeatherAnalysis() {
    const ai = useAI()

    const analyze = useCallback(
        async (context: WeatherAnalysisContext, question?: string) => {
            const contextStr = `
Lokasi: ${context.location}
Suhu: ${context.currentTemperature}°C
Kondisi: ${context.weatherCondition}
${context.humidity !== undefined ? `Kelembaban: ${context.humidity}%` : ''}
${context.windSpeed !== undefined ? `Kecepatan Angin: ${context.windSpeed} km/h` : ''}
${context.uvIndex !== undefined ? `Indeks UV: ${context.uvIndex}` : ''}
            `.trim()

            await ai.analyzeWeather(contextStr, question)
        },
        [ai]
    )

    return {
        isLoading: ai.isLoading,
        error: ai.error,
        response: ai.response,
        analyze,
        clearError: ai.clearError,
    }
}

/**
 * Hook untuk recommendation
 */
export function useWeatherRecommendations() {
    const ai = useAI()

    return {
        isLoading: ai.isLoading,
        error: ai.error,
        response: ai.response,
        getRecommendations: ai.getRecommendations,
        clearError: ai.clearError,
    }
}
