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
// API Functions
// ============================================================

/**
 * Send a message to OpenRouter API dan dapatkan respons AI
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
 * Get AI weather analysis untuk kondisi cuaca
 */
export async function getWeatherAnalysis(
    weatherContext: string,
    userQuestion?: string
): Promise<AIResponse> {
    try {
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
 * Get AI summary untuk data cuaca harian
 */
export async function getDailySummary(
    location: string,
    currentWeather: string,
    forecast: string
): Promise<AIResponse> {
    try {
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
 * Conversation dengan AI assistant untuk cuaca
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
                content: `Analisis tren cuaca berikut dan berikan insights:\n${predictionText}`,
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
    let errorMessage = 'Terjadi kesalahan saat memproses permintaan AI'
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
