/**
 * Expression Analyzer Service
 * Analyzes AI responses and determines the most suitable Kiro expression
 * Uses combination of:
 * 1. Keyword-based detection (fast, local)
 * 2. LLM-based detection (accurate, via AI)
 */

import type { KiroExpression, ExpressionResponse, ExpressionAnalysisRequest } from '@/types/expression.types'
import { EXPRESSION_DESCRIPTIONS } from '@/types/expression.types'

// ============================================================
// Fast Local Expression Detection (Keyword-based)
// ============================================================

/**
 * Keyword dictionary for each expression
 */
const EXPRESSION_KEYWORDS: Record<KiroExpression, string[]> = {
    'idle_smile': [
        'baik', 'ok', 'oke', 'siap', 'yes', 'yup', 'tentu', 'mantap',
        'bagus', 'nice', 'cool', 'halo', 'hai', 'hei', 'welcome',
        'welcome', 'selamat datang', 'kembali', 'hehe', 'haha', '😊'
    ],
    'berpikir': [
        'mikir', 'berpikir', 'tunggu', 'sebentar', 'hmm', 'hmm', 'melihat',
        'cek', 'lihat', 'memproses', 'analisis', 'pertimbang', 'saat ini',
        'moment', '🤔', 'thinking'
    ],
    'mengetik': [
        'menulis', 'mengetik', 'loading', 'tunggu sebentar', 'sedang',
        'processing', 'generating', 'typing', 'membuat'
    ],
    'semangat_success': [
        'cerah', 'bagus', 'sempurna', 'cocok', 'mantap', 'keren',
        'seru', 'asik', 'yeay', 'yuhuu', 'yes', 'excellent', 'amazing',
        'awesome', '🎉', '✨', 'senang', 'bahagia', 'excited', 'luar biasa',
        'sempurna', 'hebat', 'menarik', 'bagus sekali', 'sangat bagus'
    ],
    'hujan': [
        'hujan', 'gerimis', 'basah', 'rintik', 'deras', '🌧️',
        'rainy', 'rain', 'precipitation', 'lebat', 'turun'
    ],
    'panas': [
        'panas', 'terik', 'gerah', 'hot', 'kepanasan', 'meleleh',
        '☀️', '🌡️', '🔥', 'sinar', 'terik', 'matahari', 'panasthen',
        'extreme heat', 'heatwave'
    ],
    'dingin': [
        'dingin', 'sejuk', 'adem', 'cool', 'cold', 'freeze', 'frosty',
        '❄️', '🥶', 'brrr', 'dingin sekali', 'temperature rendah',
        'sejuk', 'pendingin', 'ac'
    ],
    'kaget': [
        'bahaya', 'peringatan', 'waspada', 'hati-hati', 'awas', 'alert',
        '⚠️', 'danger', 'warning', 'waduh', 'wadaw', 'gawat', 'urgent',
        'darurat', 'shock', 'surprised', 'wow', 'wow', 'shocking', 'ekstrem'
    ],
    'maaf': [
        'maaf', 'tidak bisa', 'error', 'gagal', 'sedih', 'sorry',
        '😢', 'failed', 'failure', 'problem', 'issue', 'kesalahan',
        'tidak bisa', 'tidak mampu', 'tidak dapat', 'cannot', 'unable'
    ],
    'thinking2': [
        'analisis', 'kompleks', 'mendalam', 'detail', 'penelitian',
        'investigating', 'analyzing', 'deep', 'thorough', 'comprehensive',
        'detailed analysis', 'riset', 'studi', 'kajian'
    ],
    'penakluk_hujan': [
        'badai', 'petir', 'topan', 'banjir', 'tornado', 'hurricane',
        '⛈️', 'lightning', 'storm', 'ekstrem', 'extreme', 'severe',
        'severe weather', 'cuaca gawat', 'ombak tinggi', 'angin kencang'
    ],
    'sedih': [
        'sedih', 'duka', 'melankolis', 'murung', 'bersedih',
        'sad', 'unhappy', 'mournful', 'sorrowful', 'unfortunate',
        'buruk', 'jelek', 'tidak bagus', 'kecewa', 'disappointment'
    ],
    'takut': [
        'takut', 'khawatir', 'cemas', 'anxious', 'nervous', 'scared',
        'frightened', 'worried', 'concerned', 'afraid', 'penakut',
        'was-was', 'gelisah', 'nervous'
    ],
    'marah': [
        'marah', 'kesal', 'gemas', 'jengkel', 'furious', 'angry',
        'upset', 'annoyed', 'irritated', 'mad', 'benci', 'hate',
        'inis', 'kecil hati', 'offense'
    ],
    'malu': [
        'malu', 'canggung', 'pemalu', 'embarrassed', 'shy', 'bashful',
        'awkward', 'uncomfortable', 'selfconscious', 'shy', 'salah tingkah'
    ],
    'jatuh_cinta': [
        'jatuh cinta', 'cinta', 'sayang', 'love', 'cute', 'cantik',
        'ganteng', 'indah', 'beautiful', 'lovely', 'charming', 'terpesona',
        'smitten', 'enamored', 'besotted', 'falls for'
    ],
    'pray': [
        'berdoa', 'harap', 'doakan', 'hope', 'pray', 'prayer',
        'semoga', 'mudah-mudahan', 'blessing', 'blessed', 'divine',
        'tuhan', 'ilahi', 'spiritual', 'faith'
    ],
    'da': [
        'bye', 'goodbye', 'sampai jumpa', 'dada', 'see you', 'farewell',
        'sampai ketemu', 'bye bye', 'cheerio', 'da', 'pamit', 'pergi'
    ],
    'bingung': [
        'bingung', 'confused', 'tidak mengerti', 'tidak paham', 'unclear',
        'unclear', 'confusing', 'loh', 'hah', '😲', 'huh', 'apa',
        'apa maksudnya', 'what', 'really', 'seriously', 'wha wha'
    ],
}

/**
 * Detect expression using keyword matching (fast, local)
 */
function detectExpressionFromKeywords(content: string): KiroExpression {
    if (!content) return 'idle_smile'

    const lower = content.toLowerCase()
    const scores: Record<KiroExpression, number> = {} as Record<KiroExpression, number>

    // Calculate match score for each expression
    for (const [expression, keywords] of Object.entries(EXPRESSION_KEYWORDS)) {
        let score = 0
        for (const keyword of keywords) {
            if (lower.includes(keyword)) {
                score += 1
            }
        }
        scores[expression as KiroExpression] = score
    }

    // Cari expression dengan score tertinggi
    const topExpression = Object.entries(scores).reduce((prev, curr) =>
        curr[1] > prev[1] ? curr : prev
    )[0] as KiroExpression

    return topExpression || 'idle_smile'
}

/**
 * Fast local expression detection (synchronous)
 */
export function analyzExpressionLocal(content: string): ExpressionResponse {
    const expression = detectExpressionFromKeywords(content)

    return {
        expression,
        confidence: 0.7, // Local detection: medium confidence
        reason: `Terdeteksi dari keyword analysis pada konten: "${content.substring(0, 50)}..."`
    }
}

/**
 * Enhanced local detection dengan advanced scoring
 */
export function analyzeExpressionLocalAdvanced(content: string): ExpressionResponse {
    try {
        // Import expression config untuk advanced scoring
        const { scoreExpressions, getBestExpressionMatch } = require('./expressionConfig')

        const topMatches = scoreExpressions(content, 3)

        if (topMatches.length > 0) {
            const best = topMatches[0]
            // Confidence based on score
            const maxPossibleScore = 20 // Rough estimate
            const confidence = Math.min(0.9, 0.5 + (best.score / maxPossibleScore))

            return {
                expression: best.expression,
                confidence,
                reason: `Advanced matching (${best.reason})`
            }
        }

        return {
            expression: 'idle_smile',
            confidence: 0.5,
            reason: 'No strong match found'
        }
    } catch (error) {
        console.warn('Advanced local analysis failed, falling back to basic:', error)
        return analyzExpressionLocal(content)
    }
}

// ============================================================
// LLM-Based Expression Detection (Accurate)
// ============================================================

interface ExpressionAnalysisMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
}

/**
 * LLM-based expression detection via Groq API
 * Lebih akurat tapi lebih lambat
 */
export async function analyzeExpressionWithLLM(
    content: string,
    context?: {
        topic?: string
        sentiment?: string
        userMood?: string
    }
): Promise<ExpressionResponse> {
    try {
        const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY
        if (!GROQ_API_KEY) {
            console.warn('Groq API key not configured, falling back to local detection')
            return analyzExpressionLocal(content)
        }

        // Buat prompt untuk LLM
        const systemPrompt = `Anda adalah ahli dalam menganalisis emosi dan ekspresi wajah untuk chatbot Kiro.
Berdasarkan konten respons AI, tentukan ekspresi wajah mana yang paling sesuai untuk Kiro.

Pilih dari ekspresi berikut:
${Object.entries(EXPRESSION_DESCRIPTIONS)
                .map(([expr, desc]) => `- ${expr}: ${desc}`)
                .join('\n')}

Berikan respons dalam JSON format:
{
  "expression": "nama_ekspresi",
  "confidence": 0.8,
  "reason": "Penjelasan singkat (maksimal 1 baris)"
}

PENTING:
1. Hanya kembalikan JSON, tidak ada teks tambahan
2. Confidence: 0.5 - 1.0
3. Reason harus singkat dan jelas`

        const userPrompt = `Analisis konten berikut dan tentukan ekspresi Kiro:

Konten: "${content}"
${context?.topic ? `Topic: ${context.topic}` : ''}
${context?.sentiment ? `Sentiment: ${context.sentiment}` : ''}
${context?.userMood ? `User Mood: ${context.userMood}` : ''}`

        const messages: ExpressionAnalysisMessage[] = [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            }
        ]

        // Call Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.3, // Lower temperature untuk deterministic output
                max_tokens: 200,
                top_p: 0.9,
            })
        })

        if (!response.ok) {
            console.warn('LLM expression analysis failed, falling back to local detection')
            return analyzExpressionLocal(content)
        }

        const data = await response.json()
        const responseText = data.choices?.[0]?.message?.content

        if (!responseText) {
            return analyzExpressionLocal(content)
        }

        // Parse JSON response
        const parsed = JSON.parse(responseText) as {
            expression?: string
            confidence?: number
            reason?: string
        }

        // Validate expression
        if (!parsed.expression || !(parsed.expression in EXPRESSION_DESCRIPTIONS)) {
            console.warn(`Invalid expression "${parsed.expression}", using fallback`)
            return analyzExpressionLocal(content)
        }

        return {
            expression: parsed.expression as KiroExpression,
            confidence: Math.min(Math.max(parsed.confidence || 0.8, 0.5), 1.0),
            reason: parsed.reason || undefined
        }

    } catch (error) {
        console.error('Error in LLM expression analysis:', error)
        // Fallback ke local detection
        return analyzExpressionLocal(content)
    }
}

/**
 * Hybrid approach: gunakan LLM tapi fallback ke local
 * Optimal balance antara speed dan accuracy
 */
export async function analyzeExpression(
    content: string,
    useLLM: boolean = true,
    context?: {
        topic?: string
        sentiment?: string
        userMood?: string
    }
): Promise<ExpressionResponse> {
    if (!useLLM) {
        return analyzExpressionLocal(content)
    }

    // Try LLM first, fallback to local
    const result = await analyzeExpressionWithLLM(content, context)
    return result
}

/**
 * Analyze expression menggunakan Vision AI
 * LLM melihat gambar ekspresi dan memilih yang paling cocok
 * Ini adalah enhanced version yang menggunakan visual intelligence
 */
export async function analyzeExpressionWithVision(
    content: string
): Promise<ExpressionResponse> {
    try {
        // Dynamically import vision service (untuk avoid server-side only code di client)
        const { analyzeAllExpressionsWithVision } = await import('./expressionVisionService')
        const result = await analyzeAllExpressionsWithVision(content)
        return result
    } catch (error) {
        console.warn('Vision analysis failed, falling back to LLM:', error)
        // Fallback ke LLM text-based analysis
        return analyzeExpressionWithLLM(content)
    }
}

/**
 * Batch analyze multiple responses
 */
export async function analyzeExpressionBatch(
    contents: string[],
    useLLM: boolean = true
): Promise<ExpressionResponse[]> {
    return Promise.all(
        contents.map(content => analyzeExpression(content, useLLM))
    )
}

/**
 * Get expression suggestions berdasarkan sentiment/topic
 */
export function getSuggestedExpressions(
    sentiment: 'positive' | 'negative' | 'neutral' | 'excited' | 'confused'
): KiroExpression[] {
    const suggestions: Record<typeof sentiment, KiroExpression[]> = {
        'positive': ['semangat_success', 'idle_smile', 'jatuh_cinta'],
        'negative': ['maaf', 'sedih', 'takut', 'marah'],
        'neutral': ['idle_smile', 'berpikir', 'bingung'],
        'excited': ['semangat_success', 'kaget', 'jatuh_cinta'],
        'confused': ['bingung', 'berpikir', 'thinking2']
    }

    return suggestions[sentiment] || ['idle_smile']
}
