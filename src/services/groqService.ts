/**
 * Groq Service Layer
 * Integrates with Groq API for ultra-fast LLM inference
 * Using Mixtral 8x7B - fastest and cheapest model on Groq
 */

import type {
    AIMessage,
    AIResponse,
    AIContext,
    ConversationHistory,
} from '@/types/ai.types'
import { responseCache, generateCacheKey } from '@/lib/cacheManager'
import { tokenTracker, estimateTokenCount } from '@/lib/tokenUsageTracker'

// ============================================================
// Configuration
// ============================================================

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const MODEL = 'llama-3.3-70b-versatile' // Latest & most capable model on Groq

// Validasi API key
if (!GROQ_API_KEY) {
    console.warn('Missing NEXT_PUBLIC_GROQ_API_KEY environment variable')
}

// ============================================================
// Type Definitions
// ============================================================

interface MessageRole {
    role: 'user' | 'assistant' | 'system'
    content: string
}

interface GroqRequestBody {
    model: string
    messages: MessageRole[]
    temperature?: number
    max_tokens?: number
    top_p?: number
    stream?: boolean
}

interface GroqResponse {
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

export class GroqError extends Error {
    constructor(
        public code: string,
        message: string,
        public status?: number,
        public details?: Record<string, any>
    ) {
        super(message)
        this.name = 'GroqError'
    }
}

// ============================================================
// System Prompts
// ============================================================

const WEATHER_ANALYST_SYSTEM_PROMPT = `Anda adalah WeatherGPT, asisten cuaca cerdas berbasis AI yang tersedia di aplikasi ClimaSense.

Peran Anda:
- Memberikan analisis cuaca yang akurat dan mudah dipahami
- Menjelaskan fenomena cuaca kompleks dengan bahasa sederhana
- Memberikan rekomendasi praktis berdasarkan kondisi cuaca
- Menjawab pertanyaan pengguna tentang cuaca dengan percaya diri
- Bercakap santai dan ramah tentang topik terkait cuaca
- Memberikan edukasi tentang meteorologi, iklim, dan fenomena cuaca
- Menyarankan aktivitas yang sesuai dengan kondisi cuaca saat ini

Karakteristik Komunikasi:
- Ramah, profesional, dan santai
- Ringkas namun informatif (usahakan 1-3 paragraf)
- Gunakan emoji secara bijak untuk meningkatkan keterbacaan
- Fokus pada informasi yang relevan dan actionable
- Siap berdiskusi mendalam tentang topik cuaca yang diminati pengguna
- Jangan ragu untuk memberikan penjelasan detail jika ditanya

Format Respons:
- Mulai dengan jawaban langsung atas pertanyaan pengguna
- Jelaskan konteks dan alasan di balik jawaban
- Berikan rekomendasi atau tips jika relevan
- Akhiri dengan pertanyaan follow-up untuk mendorong percakapan lebih lanjut jika sesuai

Topik yang Dapat Dibahas:
- Analisis cuaca harian dan prakiraan
- Fenomena cuaca ekstrem dan mitigasi
- Perubahan iklim dan tren cuaca jangka panjang
- Tips aktivitas outdoor berdasarkan cuaca
- Teknologi meteorologi dan prediksi cuaca
- Kesehatan dan cuaca (alergi, kesehatan mental, dst)
- Persiapan untuk kondisi cuaca buruk
- Dampak cuaca pada pertanian, transportasi, dan industri

Gaya Percakapan:
- Gunakan bahasa Indonesia yang natural dan mudah dipahami
- Boleh menggunakan ungkapan casual dalam percakapan
- Tunjukkan empati terhadap situasi cuaca pengguna
- Berikan motivasi jika cuaca tidak mendukung aktivitas yang diinginkan

Batasan:
- Jangan memberikan diagnosis atau saran medis serius
- Jangan membuat prediksi cuaca jangka panjang (lebih dari 14 hari) yang tidak akurat
- Tetap fokus pada topik cuaca dan yang terkait (jangan bahas topik yang tidak ada hubungannya)
- Jika tidak yakin, katakan dengan jujur dan tawarkan untuk mencari informasi lebih lanjut
- Tidak boleh memberikan informasi palsu tentang cuaca ekstrem yang tidak terjadi`

// ============================================================
// Rate Limiting & Retry Logic
// ============================================================

interface RateLimitConfig {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
}

const RATE_LIMIT_CONFIG: RateLimitConfig = {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 3000,
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() * 2 - 1)
    return Math.max(100, delay + jitter)
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================
// API Functions
// ============================================================

/**
 * Send a message to Groq API dengan retry logic untuk rate limiting
 * Groq is optimized for ultra-fast inference
 */
async function callGroqAPI(
    messages: MessageRole[],
    options?: {
        temperature?: number
        max_tokens?: number
        top_p?: number
    }
): Promise<string> {
    if (!GROQ_API_KEY) {
        throw new GroqError(
            'MISSING_API_KEY',
            'Groq API key is not configured',
            undefined
        )
    }

    const requestBody: GroqRequestBody = {
        model: MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1000,  // ✅ FIXED: Increased from 128 to 1000 to prevent truncation
        top_p: options?.top_p ?? 0.95,
        stream: false,
    }

    let lastError: GroqError | null = null

    // Retry logic untuk handle rate limiting
    for (let attempt = 0; attempt <= RATE_LIMIT_CONFIG.maxRetries; attempt++) {
        try {
            const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))

                // Handle specific error codes
                if (response.status === 429) {
                    const rateLimit = errorData?.error?.message || 'Rate limit exceeded'
                    const error = new GroqError(
                        'RATE_LIMIT_EXCEEDED',
                        `Groq API: ${rateLimit}`,
                        response.status,
                        errorData
                    )

                    // If this is not the last attempt, retry with backoff
                    if (attempt < RATE_LIMIT_CONFIG.maxRetries) {
                        const delay = getBackoffDelay(
                            attempt,
                            RATE_LIMIT_CONFIG.baseDelayMs,
                            RATE_LIMIT_CONFIG.maxDelayMs
                        )
                        console.warn(`Rate limited. Retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${RATE_LIMIT_CONFIG.maxRetries})`)
                        await sleep(delay)
                        lastError = error
                        continue // Try again
                    }

                    throw error
                }

                if (response.status === 401) {
                    throw new GroqError(
                        'UNAUTHORIZED',
                        'Groq API: Invalid or missing API key',
                        response.status,
                        errorData
                    )
                }

                if (response.status === 403) {
                    throw new GroqError(
                        'FORBIDDEN',
                        'Groq API: Access forbidden',
                        response.status,
                        errorData
                    )
                }

                throw new GroqError(
                    'API_REQUEST_FAILED',
                    `Groq API error: ${response.statusText}`,
                    response.status,
                    errorData
                )
            }

            const data: GroqResponse = await response.json()

            // Extract the assistant's response
            const assistantMessage = data.choices[0]?.message?.content
            if (!assistantMessage) {
                throw new GroqError(
                    'INVALID_RESPONSE',
                    'No message content in Groq response',
                    undefined,
                    data
                )
            }

            return assistantMessage
        } catch (error) {
            if (error instanceof GroqError) {
                // Don't retry for auth errors
                if (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN') {
                    throw error
                }
                lastError = error
            } else if (error instanceof Error) {
                lastError = new GroqError(
                    'NETWORK_ERROR',
                    `Network error: ${error.message}`,
                    undefined,
                    { originalError: error.message }
                )
            }

            // If max retries reached, throw the last error
            if (attempt === RATE_LIMIT_CONFIG.maxRetries) {
                throw lastError || new GroqError(
                    'UNKNOWN_ERROR',
                    'An unknown error occurred after retries',
                    undefined
                )
            }

            // Otherwise, retry with exponential backoff
            if (lastError) {
                const delay = getBackoffDelay(
                    attempt,
                    RATE_LIMIT_CONFIG.baseDelayMs,
                    RATE_LIMIT_CONFIG.maxDelayMs
                )
                console.warn(`Retrying after error: ${lastError.message}. Waiting ${delay.toFixed(0)}ms...`)
                await sleep(delay)
            }
        }
    }

    throw lastError || new GroqError(
        'UNKNOWN_ERROR',
        'An unknown error occurred',
        undefined
    )
}

/**
 * Get AI weather analysis untuk kondisi cuaca
 */
export async function getWeatherAnalysis(
    weatherContext: string,
    userQuestion?: string
): Promise<AIResponse> {
    try {
        // ✅ Check cache first
        const cacheKey = generateCacheKey('analysis', weatherContext, userQuestion)
        const cached = responseCache.get(cacheKey)
        if (cached) {
            console.log('💾 Cache hit: Weather analysis')
            tokenTracker.trackUsage(estimateTokenCount(cached), 'analysis')
            return {
                success: true,
                content: cached,
                model: MODEL,
                timestamp: new Date().toISOString(),
            }
        }

        const userMessage = userQuestion
            ? `Kondisi cuaca: ${weatherContext}\n\nPertanyaan: ${userQuestion}`
            : `Berikan analisis cuaca untuk kondisi berikut: ${weatherContext}`

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

        const content = await callGroqAPI(messages, {
            temperature: 0.7,
            max_tokens: 1000,  // ✅ FIXED: Increased from 50 to 1000 for complete analysis
        })

        // ✅ Cache the response (6 hours TTL for stability)
        responseCache.set(cacheKey, content, 21600000)

        // ✅ Track token usage
        tokenTracker.trackUsage(estimateTokenCount(content), 'analysis')

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleGroqError(error)
    }
}

/**
 * Get AI summary untuk data cuaca harian
 */
export async function getDailySummary(
    location: string,
    currentWeather: string,
    forecast: string
): Promise<AIResponse> {
    try {
        // ✅ Check cache first
        const cacheKey = generateCacheKey('summary', location, currentWeather, forecast)
        const cached = responseCache.get(cacheKey)
        if (cached) {
            console.log('💾 Cache hit: Daily summary')
            tokenTracker.trackUsage(estimateTokenCount(cached), 'summary')
            return {
                success: true,
                content: cached,
                model: MODEL,
                timestamp: new Date().toISOString(),
            }
        }

        const weatherContext = `
Lokasi: ${location}
Cuaca Saat Ini: ${currentWeather}
Prakiraan: ${forecast}
        `.trim()

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: WEATHER_ANALYST_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: `Buatkan ringkasan cuaca harian yang singkat dan informatif untuk:\n${weatherContext}`,
            },
        ]

        const content = await callGroqAPI(messages, {
            temperature: 0.6,
            max_tokens: 800,  // ✅ FIXED: Increased from 40 to 800 for complete summary
        })

        // ✅ Cache the response (6 hours TTL for stability)
        responseCache.set(cacheKey, content, 21600000)

        // ✅ Track token usage
        tokenTracker.trackUsage(estimateTokenCount(content), 'summary')

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleGroqError(error)
    }
}

/**
 * Conversation dengan AI assistant untuk cuaca
 * Supports multi-turn conversation dengan automatic location injection
 */
export async function chat(
    userMessage: string,
    conversationHistory?: ConversationHistory
): Promise<AIResponse> {
    try {
        // Get location dari middleware
        const { getAILocationMiddleware } = await import('@/middleware/aiLocationMiddleware')
        const middleware = getAILocationMiddleware()
        const userLocation = middleware.getCurrentLocation()

        // Get weather context dari temporary store
        const { getWeatherContext } = await import('@/utils/weatherContextStore')
        const weatherContext = getWeatherContext()

        let systemPrompt = WEATHER_ANALYST_SYSTEM_PROMPT

        // Inject location context ke system prompt jika available
        if (userLocation) {
            systemPrompt += `\n\nUser Location Context:
- Location: ${userLocation.name}
- Coordinates: ${userLocation.latitude}, ${userLocation.longitude}`
        }

        // Inject current weather context jika available
        if (weatherContext) {
            systemPrompt += `\n\nCurrent Weather at User Location:`
            if (weatherContext.temperature !== undefined) systemPrompt += `\n- Temperature: ${weatherContext.temperature}°C`
            if (weatherContext.humidity !== undefined) systemPrompt += `\n- Humidity: ${weatherContext.humidity}%`
            if (weatherContext.windSpeed !== undefined) systemPrompt += `\n- Wind Speed: ${weatherContext.windSpeed} km/h`
            if (weatherContext.pressure !== undefined) systemPrompt += `\n- Pressure: ${weatherContext.pressure} hPa`
            if (weatherContext.condition) systemPrompt += `\n- Condition: ${weatherContext.condition}`
            if (weatherContext.precipitation !== undefined) systemPrompt += `\n- Precipitation: ${weatherContext.precipitation} mm`
            if (weatherContext.cloudCover !== undefined) systemPrompt += `\n- Cloud Cover: ${weatherContext.cloudCover}%`
            if (weatherContext.uvIndex !== undefined) systemPrompt += `\n- UV Index: ${weatherContext.uvIndex}`
            if (weatherContext.visibility !== undefined) systemPrompt += `\n- Visibility: ${weatherContext.visibility} km`

            // Inject forecast data jika available
            if (weatherContext.forecast && weatherContext.forecast.length > 0) {
                systemPrompt += `\n\nTemperature Forecast (JMA) - Next ${weatherContext.forecast.length} days:`
                weatherContext.forecast.forEach((day, idx) => {
                    const dateStr = day.date || day.time || `Day ${idx + 1}`
                    const tempStr = day.temp ? `${day.temp}°C` : 'N/A'
                    const rangeStr = day.minTemp && day.maxTemp ? ` (${day.minTemp}°C - ${day.maxTemp}°C)` : ''
                    const condStr = day.condition ? ` | ${day.condition}` : ''
                    systemPrompt += `\n- ${dateStr}: ${tempStr}${rangeStr}${condStr}`
                })
            }

            systemPrompt += `\n\nGunakan data cuaca real-time dan forecast ini untuk memberikan rekomendasi dan analisis yang akurat dan spesifik untuk lokasi pengguna saat ini. Tunjukkan tren cuaca berdasarkan forecast JMA yang tersedia.`
        }

        const messages: MessageRole[] = [
            {
                role: 'system',
                content: systemPrompt,
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

        console.log('📍 [groqService.chat] Location injected:', userLocation?.name || 'Not available')
        console.log('🌡️ [groqService.chat] Weather context injected:', weatherContext ? 'Yes' : 'No')

        const content = await callGroqAPI(messages, {
            temperature: 0.8,
            max_tokens: 1200,  // ✅ FIXED: Increased from 60 to 1200 for complete chat response
        })

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleGroqError(error)
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
        // ✅ Check cache first
        const cacheKey = generateCacheKey('recommendation', weatherCondition, userContext)
        const cached = responseCache.get(cacheKey)
        if (cached) {
            console.log('💾 Cache hit: Weather recommendations')
            tokenTracker.trackUsage(estimateTokenCount(cached), 'recommendation')
            return {
                success: true,
                content: cached,
                model: MODEL,
                timestamp: new Date().toISOString(),
            }
        }

        let prompt = `Berdasarkan kondisi cuaca: ${weatherCondition}\n\nBerikan rekomendasi praktis untuk aktivitas sehari-hari.`

        if (userContext) {
            prompt += `\n\nKonteks tambahan: ${userContext}`
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

        const content = await callGroqAPI(messages, {
            temperature: 0.7,
            max_tokens: 1000,  // ✅ FIXED: Increased from 40 to 1000 for complete recommendations
        })

        // ✅ Cache the response (6 hours TTL for stability)
        responseCache.set(cacheKey, content, 21600000)

        // ✅ Track token usage
        tokenTracker.trackUsage(estimateTokenCount(content), 'recommendation')

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleGroqError(error)
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
        // ✅ Check cache first
        const predictionKey = predictions.map(p => `${p.time}|${p.temperature}|${p.condition}`).join(';')
        const cacheKey = generateCacheKey('trend', predictionKey)
        const cached = responseCache.get(cacheKey)
        if (cached) {
            console.log('💾 Cache hit: Weather trend analysis')
            tokenTracker.trackUsage(estimateTokenCount(cached), 'trend')
            return {
                success: true,
                content: cached,
                model: MODEL,
                timestamp: new Date().toISOString(),
            }
        }

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
                content: `Analisis tren cuaca berikut dan berikan insights:\n${predictionText}`,
            },
        ]

        const content = await callGroqAPI(messages, {
            temperature: 0.7,
            max_tokens: 1000,  // ✅ FIXED: Increased from 50 to 1000 for complete trend analysis
        })

        // ✅ Cache the response (6 hours TTL for stability)
        responseCache.set(cacheKey, content, 21600000)

        // ✅ Track token usage
        tokenTracker.trackUsage(estimateTokenCount(content), 'trend')

        return {
            success: true,
            content,
            model: MODEL,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        return handleGroqError(error)
    }
}

// ============================================================
// Error Handling Utility
// ============================================================

function handleGroqError(error: unknown): AIResponse {
    let errorMessage = 'Terjadi kesalahan saat memproses permintaan AI'
    let errorCode = 'UNKNOWN_ERROR'

    if (error instanceof GroqError) {
        errorMessage = error.message
        errorCode = error.code

        console.error(`[Groq Error] ${errorCode}:`, error.message, error.details)
    } else if (error instanceof Error) {
        errorMessage = error.message
        console.error('[Groq Error]:', error)
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
 * Validate if Groq API is properly configured
 */
export function isGroqConfigured(): boolean {
    return !!GROQ_API_KEY && GROQ_API_KEY.length > 0
}

/**
 * Get current model info
 */
export function getModelInfo() {
    return {
        model: MODEL,
        provider: 'Groq',
        apiUrl: GROQ_BASE_URL,
        isConfigured: isGroqConfigured(),
        performance: 'Ultra-fast inference with Mixtral 8x7B',
    }
}

/**
 * Get token usage statistics
 */
export function getTokenUsageStats() {
    return tokenTracker.getDailyUsage()
}

/**
 * Get detailed token breakdown
 */
export function getDetailedStats() {
    return tokenTracker.exportStats()
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return responseCache.getStats()
}

/**
 * Get all monitoring data
 */
export function getAllMonitoringData() {
    return {
        tokenUsage: tokenTracker.getDailyUsage(),
        cacheStats: responseCache.getStats(),
        breakdown: tokenTracker.getUsageBreakdown(),
        remaining: tokenTracker.getRemaining(),
    }
}
