/**
 * Expression Vision Service
 * Analyze Kiro expression images using Vision API
 * LLM can see visual expressions and choose the most suitable one
 */

import type { KiroExpression, ExpressionResponse } from '@/types/expression.types'
import { EXPRESSION_DESCRIPTIONS, EXPRESSION_IMAGE_MAP } from '@/types/expression.types'
import fs from 'fs'
import path from 'path'

/**
 * Interface for response from vision analysis
 */
interface VisionAnalysisResult {
    expression: KiroExpression
    confidence: number
    reason: string
    visualFeatures?: {
        emotion?: string
        facialExpression?: string
        colorPalette?: string
        overall_mood?: string
    }
}

/**
 * Convert image file to base64 for sending to LLM
 */
async function imageToBase64(imagePath: string): Promise<string> {
    try {
        const absolutePath = path.join(process.cwd(), 'public', 'maskot', imagePath)
        const imageBuffer = await fs.promises.readFile(absolutePath)
        return imageBuffer.toString('base64')
    } catch (error) {
        console.error(`Error reading image ${imagePath}:`, error)
        throw new Error(`Could not read image: ${imagePath}`)
    }
}

/**
 * Analyze one expression image using Groq Vision API
 */
async function analyzeExpressionImage(
    imagePath: string,
    userContent: string
): Promise<VisionAnalysisResult> {
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!GROQ_API_KEY) {
        throw new Error('Groq API key not configured')
    }

    try {
        // Convert image ke base64
        const base64Image = await imageToBase64(imagePath)
        const imageMediaType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

        // Prepare prompt
        const systemPrompt = `You are an expert in analyzing visual emotions and expressions of Kiro chatbot.
Analyze the expression image displayed and compare it with the content of the AI response provided.
Determine if the visual expression matches the sentiment/tone of the response content.

Evaluation:
1. What emotion is displayed on Kiro's face?
2. Is it consistent with the AI response content?
3. Confidence level: 0.5 - 1.0
4. Brief and clear explanation (1-2 sentences)`

        const userPrompt = `Analyze Kiro's visual expression in this image.

AI response content: "${userContent}"

Questions:
1. What emotion is displayed?
2. Does this expression fit the following response?
3. Give a confidence score (0.5-1.0)

Response format:
{
  "emotion": "emotion_name",
  "isAppropriate": true/false,
  "confidence": 0.8,
  "reason": "Brief explanation",
  "facialFeatures": "Description of facial features"
}`

        // Call Groq API dengan vision
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.2-90b-vision-preview', // Vision-capable model
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${imageMediaType};base64,${base64Image}`
                                }
                            },
                            {
                                type: 'text',
                                text: userPrompt
                            }
                        ]
                    }
                ],
                temperature: 0.3,
                max_tokens: 300,
            })
        })

        if (!response.ok) {
            const error = await response.json()
            console.error('Groq Vision API error:', error)
            throw new Error(`Vision API error: ${response.statusText}`)
        }

        const data = await response.json()
        const responseText = data.choices?.[0]?.message?.content

        if (!responseText) {
            throw new Error('No response from vision API')
        }

        // Parse response
        const parsed = JSON.parse(responseText) as {
            emotion?: string
            isAppropriate?: boolean
            confidence?: number
            reason?: string
            facialFeatures?: string
        }

        return {
            expression: 'idle_smile', // Will be determined by context
            confidence: Math.min(Math.max(parsed.confidence || 0.7, 0.5), 1.0),
            reason: parsed.reason || 'Visual analysis completed',
            visualFeatures: {
                emotion: parsed.emotion,
                facialExpression: parsed.facialFeatures,
                overall_mood: parsed.emotion
            }
        }
    } catch (error) {
        console.error('Error in vision analysis:', error)
        throw error
    }
}

/**
 * Analisis ALL ekspresi visual dan pilih yang paling cocok dengan konten AI
 * PURE GROQ-BASED: Let LLM decide, tidak pakai local scoring algorithm
 */
export async function analyzeAllExpressionsWithVision(
    userContent: string
): Promise<ExpressionResponse> {
    const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
    if (!GROQ_API_KEY) {
        console.warn('Groq API key not configured')
        throw new Error('Groq API key not configured')
    }

    try {
        // Create system prompt yang comprehensive dengan ALL expressions
        const systemPrompt = `Anda adalah Expert Expression Analyzer untuk Kiro Mascot AI Chat Assistant.
Tugas: Baca respons AI dari Kiro dan tentukan ekspresi wajah yang PALING COCOK.

DAFTAR SEMUA EKSPRESI YANG TERSEDIA:
${Object.entries(EXPRESSION_DESCRIPTIONS)
                .map(([expr, desc]) => `• ${expr}: ${desc}`)
                .join('\n')}

GUIDELINES:
1. Analisis tone, sentiment, dan context dari respons AI
2. Pilih ekspresi yang BEST MATCH dengan mood/pesan
3. Confidence: 0.5 (minimum) hingga 1.0 (sangat yakin)
4. Hanya return JSON, tidak ada text tambahan

RESPONS HARUS JSON:
{
  "selectedExpression": "nama_expression_dari_daftar_di_atas",
  "confidence": 0.85,
  "reason": "Penjelasan singkat mengapa expression ini dipilih"
}

CONTOH:
Input: "Thank you! That was amazing!"
Output: {"selectedExpression": "semangat_success", "confidence": 0.95, "reason": "Tone sangat positif dan grateful"}

Input: "Hujan deras banget, hati-hati!"
Output: {"selectedExpression": "penakluk_hujan", "confidence": 0.9, "reason": "Alert tentang cuaca ekstrem"}

Input: "Aku sedang memproses data..."
Output: {"selectedExpression": "berpikir", "confidence": 0.85, "reason": "Menunjukkan proses thinking"}
`

        const userPrompt = `Analisis respons AI berikut dan tentukan ekspresi Kiro yang cocok:

"${userContent}"

Respons JSON saja, tidak ada penjelasan tambahan.`

        // Call Groq API - PURE TEXT-BASED, no images (faster & cheaper)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Text model, faster
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 200,
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Groq API error:', response.status, errorText)
            throw new Error(`Groq API failed: ${response.status}`)
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || '{}'

        // Parse JSON response
        let parsed = {} as any
        try {
            // Clean up potential markdown code blocks
            let cleanedContent = content.trim()
            if (cleanedContent.startsWith('```json')) {
                cleanedContent = cleanedContent.slice(7)
            }
            if (cleanedContent.startsWith('```')) {
                cleanedContent = cleanedContent.slice(3)
            }
            if (cleanedContent.endsWith('```')) {
                cleanedContent = cleanedContent.slice(0, -3)
            }
            parsed = JSON.parse(cleanedContent.trim())
        } catch (parseError) {
            console.error('Failed to parse Groq response:', content)
            throw new Error('Invalid JSON from Groq')
        }

        // Validate & sanitize response
        const selectedExpression = parsed.selectedExpression as string
        if (!selectedExpression || !EXPRESSION_IMAGE_MAP[selectedExpression as KiroExpression]) {
            console.warn('Invalid expression from Groq:', selectedExpression)
            throw new Error(`Invalid expression: ${selectedExpression}`)
        }

        const confidence = Math.max(0.5, Math.min(1.0, Number(parsed.confidence) || 0.7))
        const reason = parsed.reason || 'Expression selected by AI'

        return {
            expression: selectedExpression as KiroExpression,
            confidence,
            reason
        }
    } catch (error) {
        console.error('Error in analyzeAllExpressionsWithVision:', error)
        throw error
    }
}

/**
 * Keyword-based filtering untuk select top candidates sebelum vision analysis
 * Ini faster dan lebih cost-effective
 */
function selectTopExpressionCandidates(content: string, topN: number = 5): KiroExpression[] {
    const EXPRESSION_KEYWORDS: Record<KiroExpression, string[]> = {
        'idle_smile': ['baik', 'ok', 'oke', 'siap', 'yes', 'welcome', 'halo', 'mantap'],
        'berpikir': ['mikir', 'berpikir', 'tunggu', 'hmm', 'memproses', 'cek', 'saat ini'],
        'mengetik': ['menulis', 'loading', 'tunggu sebentar', 'sedang', 'processing'],
        'semangat_success': ['cerah', 'sempurna', 'mantap', 'keren', 'yeay', 'excellent', 'luar biasa'],
        'hujan': ['hujan', 'gerimis', 'basah', 'rintik', 'deras', 'rainy'],
        'panas': ['panas', 'terik', 'gerah', 'hot', 'kepanasan', 'matahari'],
        'dingin': ['dingin', 'sejuk', 'adem', 'cool', 'cold', 'freeze'],
        'kaget': ['bahaya', 'peringatan', 'waspada', 'hati-hati', 'alert', 'ekstrem'],
        'maaf': ['maaf', 'error', 'gagal', 'sedih', 'sorry', 'problem'],
        'thinking2': ['analisis', 'kompleks', 'mendalam', 'detail', 'riset', 'studi'],
        'penakluk_hujan': ['badai', 'petir', 'topan', 'banjir', 'tornado', 'extreme'],
        'sedih': ['sedih', 'duka', 'murung', 'sad', 'unfortunate', 'kecewa'],
        'takut': ['takut', 'khawatir', 'cemas', 'anxious', 'nervous', 'scared'],
        'marah': ['marah', 'kesal', 'gemas', 'jengkel', 'furious', 'angry'],
        'malu': ['malu', 'canggung', 'embarrassed', 'shy', 'awkward'],
        'jatuh_cinta': ['cinta', 'sayang', 'love', 'cute', 'cantik', 'ganteng'],
        'pray': ['berdoa', 'harap', 'doakan', 'hope', 'pray', 'semoga'],
        'da': ['bye', 'goodbye', 'sampai jumpa', 'see you', 'farewell'],
        'bingung': ['bingung', 'confused', 'tidak mengerti', 'unclear', 'loh', 'huh']
    }

    const lower = content.toLowerCase()
    const scores: Record<KiroExpression, number> = {} as Record<KiroExpression, number>

    // Calculate match score
    for (const [expr, keywords] of Object.entries(EXPRESSION_KEYWORDS)) {
        let score = 0
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                score += 1
            }
        }
        scores[expr as KiroExpression] = score
    }

    // Sort by score dan return top N
    return Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topN)
        .map(([expr]) => expr as KiroExpression)
        // Selalu include idle_smile dan berpikir sebagai fallback
        .concat(['idle_smile', 'berpikir'])
        // Remove duplicates dan slice to topN
        .filter((expr, index, arr) => arr.indexOf(expr) === index)
        .slice(0, topN)
}

/**
 * Validate bahwa ekspresi yang dipilih sesuai dengan visual
 */
export async function validateExpressionWithVision(
    expression: KiroExpression,
    userContent: string
): Promise<{ isAppropriate: boolean; confidence: number; reason: string }> {
    try {
        const imagePath = EXPRESSION_IMAGE_MAP[expression]
        const base64Image = await imageToBase64(imagePath)
        const mediaType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

        const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
        if (!GROQ_API_KEY) throw new Error('Groq API key not configured')

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                    {
                        role: 'system',
                        content: `Anda adalah validator ekspresi visual. 
Analisis gambar dan tentukan apakah ekspresi visual cocok dengan konten AI.
Respons HARUS JSON: {"isAppropriate": true/false, "confidence": 0.8, "reason": "..."}`
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:${mediaType};base64,${base64Image}`
                                }
                            },
                            {
                                type: 'text',
                                text: `Apakah ekspresi "${expression}" cocok untuk respons: "${userContent}"?`
                            }
                        ]
                    }
                ],
                temperature: 0.2,
                max_tokens: 200,
            })
        })

        if (!response.ok) throw new Error('API call failed')

        const data = await response.json()
        const responseText = data.choices?.[0]?.message?.content
        const parsed = JSON.parse(responseText)

        return {
            isAppropriate: parsed.isAppropriate ?? true,
            confidence: Math.min(Math.max(parsed.confidence || 0.7, 0.5), 1.0),
            reason: parsed.reason || 'Visual validation completed'
        }
    } catch (error) {
        console.error('Error validating expression:', error)
        throw error
    }
}

/**
 * Get all available expressions dengan preview URLs
 */
export function getAvailableExpressions(): Array<{
    name: KiroExpression
    description: string
    imagePath: string
    imageUrl: string
}> {
    return Object.entries(EXPRESSION_IMAGE_MAP).map(([expr, imagePath]) => ({
        name: expr as KiroExpression,
        description: EXPRESSION_DESCRIPTIONS[expr as KiroExpression],
        imagePath,
        imageUrl: `/maskot/${imagePath}`
    }))
}

/**
 * Enhanced validation untuk memastikan expression selalu valid dan pas
 * Gunakan untuk final validation sebelum return ke client
 */
export function validateAndSanitizeExpression(
    expression: unknown,
    confidence: unknown
): ExpressionResponse {
    // Validate expression type
    if (typeof expression !== 'string') {
        console.warn('Invalid expression type:', typeof expression)
        return {
            expression: 'idle_smile',
            confidence: 0.5,
            reason: 'Fallback to default due to validation error'
        }
    }

    // Check if expression exists in map
    if (!(expression in EXPRESSION_IMAGE_MAP)) {
        console.warn('Unknown expression:', expression)
        // Try to find similar expression
        const similar = findSimilarExpression(expression)
        return {
            expression: similar,
            confidence: 0.6,
            reason: 'Expression adjusted for better match'
        }
    }

    // Validate confidence
    let conf = Number(confidence) || 0.8
    conf = Math.max(0.5, Math.min(1.0, conf)) // Clamp between 0.5-1.0

    return {
        expression: expression as KiroExpression,
        confidence: conf,
        reason: 'Valid and sanitized'
    }
}

/**
 * Find similar expression jika exact match tidak ketemu
 */
function findSimilarExpression(input: string): KiroExpression {
    const lower = input.toLowerCase()
    const expressions = Object.keys(EXPRESSION_IMAGE_MAP) as KiroExpression[]

    // Direct substring match
    for (const expr of expressions) {
        if (expr.toLowerCase().includes(lower) || lower.includes(expr.toLowerCase())) {
            return expr
        }
    }

    // Keywords match
    for (const expr of expressions) {
        const keywords = getKeywordsForExpression(expr)
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                return expr
            }
        }
    }

    // Default fallback
    return 'idle_smile'
}

/**
 * Get keywords untuk setiap expression
 */
function getKeywordsForExpression(expr: KiroExpression): string[] {
    const keywordMap: Record<KiroExpression, string[]> = {
        'idle_smile': ['halo', 'hai', 'ok', 'baik', 'siap', 'santai'],
        'berpikir': ['berpikir', 'mikir', 'tunggu', 'hmm', 'analisis'],
        'mengetik': ['mengetik', 'loading', 'processing', 'sedang'],
        'semangat_success': ['semangat', 'senang', 'hebat', 'mantap', 'excellent'],
        'hujan': ['hujan', 'gerimis', 'basah', 'rainy'],
        'panas': ['panas', 'terik', 'hot', 'kepanasan'],
        'dingin': ['dingin', 'sejuk', 'cold', 'freeze'],
        'kaget': ['kaget', 'surprised', 'shocked', 'alert', 'bahaya'],
        'maaf': ['maaf', 'sorry', 'error', 'gagal', 'problem'],
        'thinking2': ['analisis', 'riset', 'mendalam', 'kompleks'],
        'penakluk_hujan': ['badai', 'petir', 'topan', 'extreme', 'severe'],
        'sedih': ['sedih', 'sad', 'duka', 'murung', 'kecewa'],
        'takut': ['takut', 'scared', 'khawatir', 'nervous', 'cemas'],
        'marah': ['marah', 'angry', 'kesal', 'jengkel', 'furious'],
        'malu': ['malu', 'embarrassed', 'shy', 'canggung'],
        'jatuh_cinta': ['cinta', 'love', 'cantik', 'ganteng', 'jatuh_cinta'],
        'pray': ['berdoa', 'pray', 'harap', 'semoga', 'doa'],
        'da': ['bye', 'goodbye', 'farewell', 'sampai jumpa', 'da'],
        'bingung': ['bingung', 'confused', 'unclear', 'loh', 'huh']
    }

    return keywordMap[expr] || []
}
