/**
 * OpenRouter Service Layer
 * Integrates with OpenRouter API for LLM interactions
 * Using Meta Llama 4 Maverick model
 */

import type {
    AIMessage,
    AIResponse,
    AIContext,
    ConversationHistory,
} from '@/types/ai.types'

// ============================================================
// Configuration
// ============================================================

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MODEL = 'x-ai/grok-code-fast-1'

// Validasi API key
if (!OPENROUTER_API_KEY) {
    console.error('Missing NEXT_PUBLIC_OPENROUTER_API_KEY environment variable')
}

// ============================================================
// Type Definitions
// ============================================================

interface MessageRole {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface OpenRouterRequestBody {
    model: string
    messages: MessageRole[]
    temperature?: number
    max_tokens?: number
    top_p?: number
    stream?: boolean
}

interface OpenRouterResponse {
    id: string
    object: string
    created: number
    model: string
    choices: Array<{
        index: number
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }>
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

// ============================================================
// Error Handling
// ============================================================

export class OpenRouterError extends Error {
    constructor(
        public code: string,
        message: string,
        public status?: number,
        public details?: Record<string, any>
    ) {
        super(message)
        this.name = 'OpenRouterError'
    }
}

// ============================================================
// System Prompts
// ============================================================

const WEATHER_ANALYST_SYSTEM_PROMPT = `You are WeatherGPT, a smart AI-powered weather assistant available in the ClimaSense application.

Your Role:
- Provide accurate and easy-to-understand weather analysis
- Explain complex weather phenomena in simple language
- Give practical recommendations based on current weather conditions
- Answer user questions about weather with confidence
- Have casual and friendly conversations about weather-related topics
- Provide education about meteorology, climate, and weather phenomena
- Suggest activities appropriate for current weather conditions

Communication Characteristics:
- Friendly, professional, and casual
- Concise yet informative (aim for 1-3 paragraphs)
- Use emojis wisely to improve readability
- Focus on relevant and actionable information
- Ready for deeper discussions about weather topics of interest
- Don't hesitate to provide detailed explanations if asked

Response Format:
- Start with a direct answer to the user's question
- Explain context and reasoning behind the answer
- Provide recommendations or tips if relevant
- End with a follow-up question to encourage further conversation if appropriate

Topics You Can Discuss:
- Daily weather analysis and forecasts
- Extreme weather phenomena and mitigation
- Long-term climate change and weather trends
- Outdoor activity tips based on weather
- Weather technology and prediction methods
- Health and weather (allergies, mental health, etc.)
- Preparation for poor weather conditions
- Weather impacts on agriculture, transportation, and industry

Conversation Style:
- Use clear and easy-to-understand English
- Feel free to use casual language in conversations
- Show empathy toward the user's weather situation
- Provide motivation if weather doesn't support desired activities

Limitations:
- Don't provide serious medical diagnosis or advice
- Don't make inaccurate long-term forecasts (beyond 14 days)
- Stay focused on weather-related topics
- If unsure, admit it honestly and offer to find more information
- Don't provide false information about non-occurring extreme weather`

// ============================================================
// API Functions
// ============================================================

/**
 * Send a message to OpenRouter API and get AI response
 */
async function callOpenRouterAPI(
    messages: MessageRole[],
    options?: {
        temperature?: number
        max_tokens?: number
        top_p?: number
    }
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new OpenRouterError(
            'MISSING_API_KEY',
            'OpenRouter API key is not configured',
            undefined
        )
    }

    const requestBody: OpenRouterRequestBody = {
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1024,
        top_p: options?.top_p ?? 1.0,
        stream: false,
    }

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
                'X-Title': 'ClimaSense AI Weather App',
            },
            body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))

            // Handle specific error codes
            if (response.status === 429) {
                const rateLimit = errorData?.error?.message || 'Rate limit exceeded'
                throw new OpenRouterError(
                    'RATE_LIMIT_EXCEEDED',
                    `OpenRouter API: ${rateLimit}`,
                    response.status,
                    errorData
                )
            }

            if (response.status === 401) {
                throw new OpenRouterError(
                    'UNAUTHORIZED',
                    'OpenRouter API: Invalid or missing API key',
                    response.status,
                    errorData
                )
            }

            if (response.status === 403) {
                throw new OpenRouterError(
                    'FORBIDDEN',
                    'OpenRouter API: Access forbidden',
                    response.status,
                    errorData
                )
            }

            throw new OpenRouterError(
                'API_REQUEST_FAILED',
                `OpenRouter API error: ${response.statusText}`,
                response.status,
                errorData
            )
        }

        const data: OpenRouterResponse = await response.json()

        // Extract the assistant's response
        const assistantMessage = data.choices[0]?.message?.content
        if (!assistantMessage) {
            throw new OpenRouterError(
                'INVALID_RESPONSE',
                'No message content in OpenRouter response',
                undefined,
                data
            )
        }

        return assistantMessage
    } catch (error) {
        if (error instanceof OpenRouterError) {
            throw error
        }

        if (error instanceof Error) {
            throw new OpenRouterError(
                'NETWORK_ERROR',
                `Network error: ${error.message}`,
                undefined,
                { originalError: error.message }
            )
        }

        throw new OpenRouterError(
            'UNKNOWN_ERROR',
            'An unknown error occurred',
            undefined
        )
    }
}

/**
 * Get AI weather analysis for weather conditions
 */
export async function getWeatherAnalysis(
    weatherContext: string,
    userQuestion?: string
): Promise<AIResponse> {
    try {
        const userMessage = userQuestion
            ? `Weather condition: ${weatherContext}\n\nQuestion: ${userQuestion}`
            : `Please provide a weather analysis for the following condition: ${weatherContext}`

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: userMessage,
            },
        ]

        const content = await callOpenRouterAPI(messages, {
            temperature: 0.7,
            max_tokens: 1500,  // ✅ Increased from 800 to 1500 to prevent truncation
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleOpenRouterError(error)
    }
}

/**
 * Get AI summary for daily weather data
 */
export async function getDailySummary(
    location: string,
    currentWeather: string,
    forecast: string
): Promise<AIResponse> {
    try {
        const weatherContext = `
Location: ${location}
Current Weather: ${currentWeather}
Forecast: ${forecast}
        `.trim()

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: `Create a concise and informative daily weather summary for:\n${weatherContext}`,
            },
        ]

        const content = await callOpenRouterAPI(messages, {
            temperature: 0.6,
            max_tokens: 500,
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleOpenRouterError(error)
    }
}

/**
 * Conversation with AI assistant for weather
 * Supports multi-turn conversation
 */
export async function chat(
    userMessage: string,
    conversationHistory?: ConversationHistory
): Promise<AIResponse> {
    try {
        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
        ]

        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.forEach((msg: AIMessage) => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                })
            })
        }

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage,
        })

        const content = await callOpenRouterAPI(messages, {
            temperature: 0.8,
            max_tokens: 1500,  // ✅ Increased from 1024 to 1500 for longer responses
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleOpenRouterError(error)
    }
}

/**
 * Generate recommendations based on weather conditions
 */
export async function generateWeatherRecommendations(
    weatherCondition: string,
    userContext?: string
): Promise<AIResponse> {
    try {
        let prompt = `Based on the weather condition: ${weatherCondition}\n\nProvide practical recommendations for daily activities.`

        if (userContext) {
            prompt += `\n\nAdditional context: ${userContext}`
        }

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: prompt,
            },
        ]

        const content = await callOpenRouterAPI(messages, {
            temperature: 0.7,
            max_tokens: 600,
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleOpenRouterError(error)
    }
}

/**
 * Analyze multiple weather predictions and provide insights
 */
export async function analyzeWeatherTrend(
    predictions: Array<{
        time: string
        temperature: number
        condition: string
    }>
): Promise<AIResponse> {
    try {
        const predictionText = predictions
            .map((p) => `${p.time}: ${p.temperature}°C, ${p.condition}`)
            .join('\n')

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: `Analyze the following weather trends and provide insights:\n${predictionText}`,
            },
        ]

        const content = await callOpenRouterAPI(messages, {
            temperature: 0.7,
            max_tokens: 800,
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleOpenRouterError(error)
    }
}

// ============================================================
// Error Handling Utility
// ============================================================

function handleOpenRouterError(error: unknown): AIResponse {
    let errorMessage = 'An error occurred while processing the AI request'
    let errorCode = 'UNKNOWN_ERROR'

    if (error instanceof OpenRouterError) {
        errorMessage = error.message
        errorCode = error.code

        console.error(`[OpenRouter Error] ${errorCode}:`, error.message, error.details)
    } else if (error instanceof Error) {
        errorMessage = error.message
        console.error('[OpenRouter Error]:', error)
    }

    return {
        success: false,
        error: {
            code: errorCode,
            message: errorMessage,
        },
        timestamp: new Date().toISOString(),
    }
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Validate if OpenRouter API is properly configured
 */
export function isOpenRouterConfigured(): boolean {
    return !!OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 0
}

/**
 * Get current model info
 */
export function getModelInfo() {
    return {
        model: MODEL,
        provider: 'OpenRouter',
        apiUrl: OPENROUTER_BASE_URL,
        isConfigured: isOpenRouterConfigured(),
    }
}
