/**
 * Groq Service Extension: Location-Aware Chat
 * 
 * Extends groqService dengan capability untuk inject location context
 * ke dalam sistem prompt atau conversation history secara transparan
 */

import { getAILocationMiddleware, type EnhancedAIRequest } from '@/middleware/aiLocationMiddleware'
import type { ConversationHistory } from '@/types/ai.types'
import type { LocationCoordinates } from '@/types/weather.types'

// ============================================================
// Types
// ============================================================

interface LocationContext {
    location: LocationCoordinates
    addressLine: string
    utcOffset?: string
}

interface EnhancedChatOptions {
    includeLocationSystemContext?: boolean
    includeLocationInHistory?: boolean
    locationPrefix?: boolean
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Build location context string untuk system prompt
 */
function buildLocationSystemContext(location: LocationCoordinates): string {
    return `\n\nUser Location Context:
- Location: ${location.name}
- Latitude: ${location.latitude}
- Longitude: ${location.longitude}

Gunakan informasi lokasi ini untuk memberikan rekomendasi yang relevan secara geografis.`
}

/**
 * Build location info untuk conversation history (hidden)
 */
function buildLocationHistoryMarker(location: LocationCoordinates): string {
    return `[User Location: ${location.name} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})]`
}

/**
 * Enhance conversation history dengan location context
 */
function enhanceHistoryWithLocation(
    history: ConversationHistory,
    location: LocationCoordinates | null,
    options: EnhancedChatOptions = {}
): ConversationHistory {
    if (!location || !options.includeLocationInHistory) {
        return history
    }

    // Inject location marker di awal conversation
    if (history.length === 0) {
        return [
            {
                role: 'system',
                content: `Context: User is currently in ${location.name}`,
                timestamp: new Date().toISOString(),
            },
        ]
    }

    // Atau append ke user message pertama
    const enhanced = [...history]
    if (enhanced[0]?.role === 'user') {
        const marker = buildLocationHistoryMarker(location)
        enhanced[0] = {
            ...enhanced[0],
            content: `${marker}\n\n${enhanced[0].content}`,
        }
    }

    return enhanced
}

/**
 * Create enhanced chat request dengan automatic location
 */
export function createEnhancedChatRequest(
    message: string,
    conversationHistory: ConversationHistory = [],
    options: EnhancedChatOptions = {}
) {
    const middleware = getAILocationMiddleware()
    const enhanced = middleware.enhanceRequest(message)

    const config = {
        includeLocationSystemContext: true,
        includeLocationInHistory: true,
        ...options,
    }

    // Build location context untuk system prompt
    let locationSystemContext = ''
    if (config.includeLocationSystemContext && enhanced.userLocation) {
        locationSystemContext = buildLocationSystemContext(enhanced.userLocation)
    }

    // Enhance conversation history
    let enhancedHistory = conversationHistory
    if (config.includeLocationInHistory && enhanced.userLocation) {
        enhancedHistory = enhanceHistoryWithLocation(
            conversationHistory,
            enhanced.userLocation,
            config
        )
    }

    console.log('🔗 [enhancedChatRequest]', {
        hasLocation: !!enhanced.userLocation,
        locationName: enhanced.userLocation?.name,
        historyLength: enhancedHistory.length,
    })

    return {
        message,
        enhanced,
        locationSystemContext,
        enhancedHistory,
        userLocation: enhanced.userLocation,
    }
}

/**
 * Format user message dengan location prefix (optional)
 */
export function formatMessageWithLocationPrefix(
    message: string,
    location: LocationCoordinates | null
): string {
    if (!location) return message

    return `[📍 From ${location.name}]\n\n${message}`
}

// ============================================================
// Location Injection Helper
// ============================================================

export interface LocationInjectionResult {
    originalMessage: string
    enhancedMessage: string
    messageWithPrefix: string
    userLocation: LocationCoordinates | null
    systemContextHint: string
    conversationMarker: string | null
}

/**
 * Complete location injection workflow
 */
export function injectLocationToRequest(
    message: string,
    options: EnhancedChatOptions = {}
): LocationInjectionResult {
    const middleware = getAILocationMiddleware()
    const location = middleware.getCurrentLocation()

    const result: LocationInjectionResult = {
        originalMessage: message,
        enhancedMessage: message,
        messageWithPrefix: message,
        userLocation: location,
        systemContextHint: '',
        conversationMarker: null,
    }

    if (!location) {
        console.warn('⚠️ [injectLocationToRequest] No location available')
        return result
    }

    // Build variants
    result.systemContextHint = buildLocationSystemContext(location)
    result.conversationMarker = buildLocationHistoryMarker(location)
    result.messageWithPrefix = formatMessageWithLocationPrefix(message, location)

    console.log('📍 [injectLocationToRequest] Location injected:', {
        location: location.name,
        coordinates: [location.latitude, location.longitude],
    })

    return result
}

// ============================================================
// Export helpers
// ============================================================

export type { LocationContext, EnhancedChatOptions }
