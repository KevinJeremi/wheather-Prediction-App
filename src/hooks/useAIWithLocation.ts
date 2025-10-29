/**
 * Hook: useAIWithLocation
 * 
 * Wrapper on top of useAI that:
 * 1. Integrated with Location Middleware
 * 2. Auto-inject location to every AI request
 * 3. Maintain conversation history with location context
 * 4. Transparent to caller
 */

'use client'

import { useCallback, useRef, useEffect } from 'react'
import { useAI } from './useAI'
import { getAILocationMiddleware, type EnhancedAIRequest } from '@/middleware/aiLocationMiddleware'
import type { LocationCoordinates } from '@/types/weather.types'

// ============================================================
// Types
// ============================================================

interface UseAIWithLocationState {
    userLocation: LocationCoordinates | null
    isLocationReady: boolean
    locationError: string | null
}

interface UseAIWithLocationCallbacks {
    /**
     * Chat with automatic location injection + weather data + forecast
     * Location is added automatically, no need to pass
     */
    chatWithLocation: (message: string, weatherData?: {
        temperature?: number
        humidity?: number
        windSpeed?: number
        pressure?: number
        condition?: string
        precipitation?: number
        cloudCover?: number
        uvIndex?: number
        visibility?: number
        forecast?: Array<{
            date?: string
            time?: string
            temp?: number
            minTemp?: number
            maxTemp?: number
            condition?: string
            precipitation?: number
        }>
    }) => Promise<void>

    /**
     * Analyze weather with location context
     */
    analyzeWeatherWithLocation: (
        context: string,
        question?: string
    ) => Promise<void>

    /**
     * Get recommendations with location context
     */
    getRecommendationsWithLocation: (
        condition: string,
        context?: string
    ) => Promise<void>

    /**
     * Manually set location override
     */
    setLocationOverride: (location: LocationCoordinates) => void

    /**
     * Disable location injection (fallback)
     */
    disableLocationInjection: () => void

    /**
     * Enable location injection
     */
    enableLocationInjection: () => void
}

// ============================================================
// Main Hook
// ============================================================

export function useAIWithLocation() {
    const ai = useAI()
    const middleware = getAILocationMiddleware()

    // Local state for location
    const locationStateRef = useRef<UseAIWithLocationState>({
        userLocation: middleware.getCurrentLocation(),
        isLocationReady: false,
        locationError: null,
    })

    const injectionEnabledRef = useRef(true)

    // ========================================================
    // Setup: Subscribe to location changes
    // ========================================================

    useEffect(() => {
        // Get initial location
        const initial = middleware.getCurrentLocation()
        if (initial) {
            locationStateRef.current.userLocation = initial
            locationStateRef.current.isLocationReady = true
            console.log('📍 [useAIWithLocation] Initial location:', initial)
        }

        // Subscribe to location changes
        const unsubscribe = middleware.onLocationChange((location) => {
            locationStateRef.current.userLocation = location
            locationStateRef.current.isLocationReady = !!location
            console.log('📍 [useAIWithLocation] Location updated:', location)
        })

        return () => {
            unsubscribe()
        }
    }, [middleware])

    // ========================================================
    // Helper: Build prompt with location context
    // ========================================================

    const buildEnhancedPrompt = useCallback(
        (message: string): EnhancedAIRequest => {
            const enhanced = middleware.enhanceRequest(message)

            // Optionally add location hint to message if desired
            // (This is for advanced usage - default disable)
            // if (injectionEnabledRef.current && enhanced.userLocation) {
            //   message = `[📍 From ${enhanced.userLocation.name}] ${message}`
            // }

            return enhanced
        },
        [middleware]
    )

    // ========================================================
    // Enhanced Chat Handler
    // ========================================================

    const chatWithLocation = useCallback(
        async (message: string, weatherData?: {
            temperature?: number
            humidity?: number
            windSpeed?: number
            pressure?: number
            condition?: string
            precipitation?: number
            cloudCover?: number
            uvIndex?: number
            visibility?: number
            forecast?: Array<{
                date?: string
                time?: string
                temp?: number
                minTemp?: number
                maxTemp?: number
                condition?: string
                precipitation?: number
            }>
        }) => {
            if (!injectionEnabledRef.current) {
                // Fallback ke chat biasa
                await ai.chat(message)
                return
            }

            const enhanced = buildEnhancedPrompt(message)

            console.log('💬 [useAIWithLocation] Chat with location:', {
                userMessage: message,
                hasLocation: !!enhanced.userLocation,
                locationName: enhanced.userLocation?.name,
                hasWeatherData: !!weatherData,
                hasForecast: !!weatherData?.forecast,
                forecastDays: weatherData?.forecast?.length || 0,
            })

            // Set weather context ke temporary store
            if (weatherData) {
                const { setWeatherContext } = await import('@/utils/weatherContextStore')
                setWeatherContext(weatherData)
            }

            // Call original ai.chat - it will pick up weather context from store
            try {
                await ai.chat(message)
            } finally {
                // Clear weather context after chat
                const { clearWeatherContext } = await import('@/utils/weatherContextStore')
                clearWeatherContext()
            }
        },
        [ai, buildEnhancedPrompt]
    )

    // ========================================================
    // Enhanced Weather Analysis
    // ========================================================

    const analyzeWeatherWithLocation = useCallback(
        async (context: string, question?: string) => {
            if (!injectionEnabledRef.current) {
                await ai.analyzeWeather(context, question)
                return
            }

            const enhanced = buildEnhancedPrompt(question || context)

            // Enhance context with location info
            let enhancedContext = context
            if (enhanced.userLocation) {
                enhancedContext = `
Location: ${enhanced.userLocation.name}
Coordinates: [${enhanced.userLocation.latitude}, ${enhanced.userLocation.longitude}]

${context}
            `.trim()
            }

            console.log('🌤️ [useAIWithLocation] Weather analysis with location:', {
                location: enhanced.userLocation?.name,
                hasContext: !!context,
                hasQuestion: !!question,
            })

            await ai.analyzeWeather(enhancedContext, question)
        },
        [ai, buildEnhancedPrompt]
    )

    // ========================================================
    // Enhanced Recommendations
    // ========================================================

    const getRecommendationsWithLocation = useCallback(
        async (condition: string, context?: string) => {
            if (!injectionEnabledRef.current) {
                await ai.getRecommendations(condition, context)
                return
            }

            const enhanced = buildEnhancedPrompt(`Recommendation for: ${condition}`)

            // Enhance context
            let enhancedContext = context || ''
            if (enhanced.userLocation) {
                enhancedContext = `
Location: ${enhanced.userLocation.name}
${context ? context : ''}
            `.trim()
            }

            console.log('💡 [useAIWithLocation] Recommendations with location:', {
                condition,
                location: enhanced.userLocation?.name,
            })

            await ai.getRecommendations(condition, enhancedContext)
        },
        [ai, buildEnhancedPrompt]
    )

    // ========================================================
    // Location Management
    // ========================================================

    const setLocationOverride = useCallback((location: LocationCoordinates) => {
        middleware.setLocation(location)
        locationStateRef.current.userLocation = location
        locationStateRef.current.isLocationReady = true
        console.log('🔧 [useAIWithLocation] Location override set:', location)
    }, [middleware])

    const disableLocationInjection = useCallback(() => {
        injectionEnabledRef.current = false
        console.log('⚠️ [useAIWithLocation] Location injection disabled')
    }, [])

    const enableLocationInjection = useCallback(() => {
        injectionEnabledRef.current = true
        console.log('✅ [useAIWithLocation] Location injection enabled')
    }, [])

    // ========================================================
    // Return Object
    // ========================================================

    const callbacks: UseAIWithLocationCallbacks = {
        chatWithLocation,
        analyzeWeatherWithLocation,
        getRecommendationsWithLocation,
        setLocationOverride,
        disableLocationInjection,
        enableLocationInjection,
    }

    return {
        // AI state
        isLoading: ai.isLoading,
        error: ai.error,
        response: ai.response,
        messageCount: ai.messageCount,
        conversationMemory: ai.conversationMemory,

        // Location state
        userLocation: locationStateRef.current.userLocation,
        isLocationReady: locationStateRef.current.isLocationReady,
        locationError: locationStateRef.current.locationError,

        // Callbacks
        ...callbacks,

        // Original AI callbacks (fallback)
        chat: ai.chat,
        analyzeWeather: ai.analyzeWeather,
        getRecommendations: ai.getRecommendations,
        clearHistory: ai.clearHistory,
        clearError: ai.clearError,

        // Debug
        getMiddlewareDebugInfo: () => middleware.getDebugInfo(),
    }
}

// ============================================================
// Specialized Hooks
// ============================================================

/**
 * Simple hook for location-aware chatting
 */
export function useLocationAwareChat() {
    const { chatWithLocation, isLoading, error, response, userLocation } = useAIWithLocation()

    return {
        sendMessage: chatWithLocation,
        isLoading,
        error,
        response,
        userLocation,
    }
}

/**
 * Hook for location-aware weather analysis
 */
export function useLocationAwareWeatherAnalysis() {
    const { analyzeWeatherWithLocation, isLoading, error, response, userLocation } =
        useAIWithLocation()

    return {
        analyze: analyzeWeatherWithLocation,
        isLoading,
        error,
        response,
        userLocation,
    }
}
