/**
 * AI Service Types
 * Type definitions untuk OpenRouter API dan AI interactions
 */

// ============================================================
// Message Types
// ============================================================

export interface AIMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: string
}

export type ConversationHistory = AIMessage[]

// ============================================================
// Response Types
// ============================================================

export interface AIResponse {
    success: boolean
    content?: string
    model?: string
    timestamp: string
    error?: {
        code: string
        message: string
        details?: Record<string, any>
    }
}

export interface AIAnalysisResponse extends AIResponse {
    analysis?: {
        summary: string
        insights: string[]
        recommendations: string[]
    }
}

// ============================================================
// Context Types
// ============================================================

export interface AIContext {
    location: string
    currentTemperature: number
    weatherCondition: string
    humidity?: number
    windSpeed?: number
    uvIndex?: number
    additionalInfo?: Record<string, any>
}

export interface WeatherAnalysisContext extends AIContext {
    forecast?: string
    historicalData?: string
    userPreferences?: {
        tone?: 'casual' | 'professional' | 'technical'
        language?: 'id' | 'en'
        detailLevel?: 'brief' | 'detailed'
    }
}

// ============================================================
// Request Types
// ============================================================

export interface WeatherAnalysisRequest {
    weatherContext: string
    userQuestion?: string
}

export interface DailySummaryRequest {
    location: string
    currentWeather: string
    forecast: string
}

export interface ChatRequest {
    userMessage: string
    conversationHistory?: ConversationHistory
    maxTokens?: number
    temperature?: number
}

export interface TrendAnalysisRequest {
    predictions: Array<{
        time: string
        temperature: number
        condition: string
        humidity?: number
        windSpeed?: number
    }>
    period?: 'hourly' | 'daily'
}

// ============================================================
// Configuration Types
// ============================================================

export interface OpenRouterConfig {
    apiKey: string
    model: string
    baseUrl: string
    defaultTemperature?: number
    defaultMaxTokens?: number
    timeout?: number
}

export interface AIServiceOptions {
    temperature?: number
    maxTokens?: number
    topP?: number
    retryAttempts?: number
    retryDelay?: number
}

// ============================================================
// Error Types
// ============================================================

export interface AIServiceError {
    code: string
    message: string
    status?: number
    details?: Record<string, any>
    timestamp: string
}

export class AIServiceException extends Error {
    constructor(
        public code: string,
        message: string,
        public status?: number,
        public details?: Record<string, any>
    ) {
        super(message)
        this.name = 'AIServiceException'
    }
}

// ============================================================
// Cache Types (for optimization)
// ============================================================

export interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

export interface CacheStats {
    size: number
    hits: number
    misses: number
    hitRate: number
}

// ============================================================
// Streaming Response Types (for future implementation)
// ============================================================

export interface StreamingResponse {
    model: string
    timestamp: string
    stream: AsyncIterable<string>
}

export interface StreamChunk {
    delta: {
        content?: string
        role?: string
    }
    index: number
    finishReason?: string
}
