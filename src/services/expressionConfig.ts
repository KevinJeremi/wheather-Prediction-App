/**
 * Expression Configuration & Rules
 * Maps expressions, keywords, and validation rules for each expression
 */

import type { KiroExpression } from '@/types/expression.types'

/**
 * Enhanced Expression Mapping with scoring rules
 */
export const EXPRESSION_CONFIG: Record<KiroExpression, {
    name: string
    keywords: string[]
    sentiments: string[]
    priority: number // 1-10, higher = more suitable when ambiguous
    triggerPatterns: RegExp[]
}> = {
    'idle_smile': {
        name: 'Relaxed & Happy',
        keywords: ['ready to help', 'how are you', 'can help', 'ask', 'chat', 'talking', 'general', 'casual', 'okay', 'alright'],
        sentiments: ['happy', 'neutral', 'friendly', 'welcoming', 'helpful'],
        priority: 4,
        triggerPatterns: [/siap\s+membantu|apa\s+kabar|boleh|bisa\s+bantu|general\s+chat/i]
    },

    'berpikir': {
        name: 'Thinking',
        keywords: ['think', 'wait', 'hmm', 'processing', 'check', 'see', 'analyze'],
        sentiments: ['thinking', 'processing', 'analyzing', 'considering'],
        priority: 5,
        triggerPatterns: [/hmm|🤔|thinking/i]
    },

    'mengetik': {
        name: 'Typing',
        keywords: ['typing', 'loading', 'processing', 'generating', 'creating', 'wait'],
        sentiments: ['working', 'processing', 'generating'],
        priority: 4,
        triggerPatterns: [/typing|loading|processing/i]
    },

    'semangat_success': {
        name: 'Very Happy',
        keywords: ['thank you', 'thankful', 'great', 'perfect', 'awesome', 'cool', 'yay', 'excellent', 'amazing', 'awesome', 'great', 'so happy', 'happy', 'excited'],
        sentiments: ['excited', 'happy', 'enthusiastic', 'positive', 'successful', 'gratified'],
        priority: 9,
        triggerPatterns: [/🎉|terima\s+kasih|thank\s+you|excellent|amazing|awesome|yeay|bagus\s+(sekali|banget)/i]
    },

    'hujan': {
        name: 'Rainy Weather',
        keywords: ['monitoring rain', 'light rain', 'heavy rain', 'rainfall', 'umbrella', 'wet', 'drizzle', 'heavy drops', 'precipitation'],
        sentiments: ['rainy', 'wet', 'drizzle', 'stormy_weather'],
        priority: 5,
        triggerPatterns: [/hujan\s+(gerimis|deras|turun)|🌧️\s+hujan|rainy\s+(day|weather)/i]
    },

    'panas': {
        name: 'Hot Weather',
        keywords: ['hot', 'sunny', 'humid', 'hot', 'overheated', 'melting', 'sun', 'rays'],
        sentiments: ['hot', 'sunny', 'warm', 'heat'],
        priority: 7,
        triggerPatterns: [/panas|terik|☀️|🔥|hot|heatwave/i]
    },

    'dingin': {
        name: 'Cold Weather',
        keywords: ['cold', 'cool', 'chill', 'cool', 'cold', 'freeze', 'frosty', 'cooling'],
        sentiments: ['cold', 'cool', 'chilly', 'freezing'],
        priority: 7,
        triggerPatterns: [/dingin|❄️|🥶|cold|freeze/i]
    },

    'kaget': {
        name: 'Surprised/Alert',
        keywords: ['danger', 'warning', 'caution', 'careful', 'alert', 'danger', 'extreme', 'shock', 'surprised'],
        sentiments: ['alert', 'warning', 'danger', 'surprised'],
        priority: 9,
        triggerPatterns: [/⚠️|bahaya|peringatan|alert|danger|ekstrem/i]
    },

    'maaf': {
        name: 'Apology',
        keywords: ['sorry', 'cannot', 'error', 'failed', 'sorry', 'failed', 'failure', 'problem', 'issue', 'mistake'],
        sentiments: ['sorry', 'error', 'failed', 'apologetic'],
        priority: 6,
        triggerPatterns: [/maaf|sorry|error|failed|problem/i]
    },

    'thinking2': {
        name: 'Deep Thinking',
        keywords: ['analysis', 'complex', 'deep', 'detail', 'research', 'study', 'research', 'investigating'],
        sentiments: ['analytical', 'deep_thinking', 'research', 'detailed'],
        priority: 5,
        triggerPatterns: [/analisis|riset|penelitian|detailed\s+analysis/i]
    },

    'penakluk_hujan': {
        name: 'Facing Storm',
        keywords: ['storm', 'lightning', 'tornado', 'flood', 'tornado', 'hurricane', 'lightning', 'storm', 'severe', 'extreme'],
        sentiments: ['storm', 'severe', 'extreme', 'thunderstorm'],
        priority: 10,
        triggerPatterns: [/⛈️|badai|petir|topan|tornado|hurricane|extreme\sweather/i]
    },

    'sedih': {
        name: 'Sad',
        keywords: ['sad', 'grief', 'melancholic', 'gloomy', 'sad', 'unhappy', 'sorrowful', 'disappointed', 'disappointment'],
        sentiments: ['sad', 'unhappy', 'melancholic', 'disappointed'],
        priority: 8,
        triggerPatterns: [/sedih|😢|sad|unhappy|melancholic/i]
    },

    'takut': {
        name: 'Scared/Worried',
        keywords: ['scared', 'worried', 'nervous', 'anxious', 'nervous', 'scared', 'frightened', 'worried', 'concerned'],
        sentiments: ['scared', 'anxious', 'worried', 'afraid'],
        priority: 7,
        triggerPatterns: [/takut|khawatir|cemas|scared|anxious/i]
    },

    'marah': {
        name: 'Angry',
        keywords: ['angry', 'annoyed', 'frustrated', 'irritated', 'furious', 'angry', 'upset', 'annoyed', 'irritated'],
        sentiments: ['angry', 'furious', 'upset', 'annoyed'],
        priority: 8,
        triggerPatterns: [/marah|kesal|furious|angry|upset/i]
    },

    'malu': {
        name: 'Embarrassed',
        keywords: ['embarrassed', 'awkward', 'embarrassed', 'shy', 'bashful', 'awkward', 'uncomfortable'],
        sentiments: ['embarrassed', 'shy', 'awkward'],
        priority: 6,
        triggerPatterns: [/malu|embarrassed|shy|awkward/i]
    },

    'jatuh_cinta': {
        name: 'In Love',
        keywords: ['beautiful', 'handsome', 'love', 'dear', 'love you', 'kyaaaa', 'charmed', 'crush', 'uwu', 'love is', 'i love', 'cute', 'beautiful', 'charming', 'love', 'hug', 'heart'],
        sentiments: ['love', 'romantic', 'attracted', 'adored', 'charmed', 'affectionate'],
        priority: 10,
        triggerPatterns: [/❤️|💕|💘|kamu\s+(cantik|ganteng)|cinta|kyaaaa|uwu|love\s+(you|is)|sayang|crush/i]
    },

    'pray': {
        name: 'Praying',
        keywords: ['pray', 'hope', 'pray', 'hope', 'pray', 'prayer', 'hope', 'blessing', 'spiritual', 'faith'],
        sentiments: ['hopeful', 'spiritual', 'prayerful', 'blessing'],
        priority: 5,
        triggerPatterns: [/berdoa|harap|semoga|prayer|hope/i]
    },

    'da': {
        name: 'Goodbye',
        keywords: ['bye', 'goodbye', 'see you', 'see you', 'farewell', 'cheerio', 'goodbye', 'leave'],
        sentiments: ['goodbye', 'farewell', 'departure'],
        priority: 5,
        triggerPatterns: [/bye|goodbye|sampai\sjumpa|farewell/i]
    },

    'bingung': {
        name: 'Confused',
        keywords: ['confused', 'confused', 'don\'t understand', 'unclear', 'confusing', 'huh', 'huh', 'what', 'what'],
        sentiments: ['confused', 'unclear', 'puzzled'],
        priority: 6,
        triggerPatterns: [/bingung|confused|🤨|unclear|loh/i]
    }
}

/**
 * Smart scoring algorithm untuk match expressions
 * Returns top matches dengan scores
 * Includes contextual awareness untuk avoid dominasi one expression
 */
export function scoreExpressions(
    content: string,
    limit: number = 5
): Array<{ expression: KiroExpression; score: number; reason: string }> {
    const lower = content.toLowerCase()
    const scores: Array<{ expression: KiroExpression; score: number; reason: string }> = []

    // Detect context untuk penalty/bonus - LEBIH GRANULAR
    const isWeatherTalk = /cuaca|hujan|panas|dingin|forecast|temperature|°c|suhu|forecast|weather/i.test(content)
    const isDialogTalk = /kamu|aku|gaya|pergi|jalan|pakai|wearing|hangout|keluar/i.test(content)

    // ROMANTIC CONTEXT - More comprehensive detection
    const isRomantic = /cinta|sayang|love|cantik|ganteng|uwu|peluk|hati|crush|terpesona|❤️|💕|💘/i.test(content)
    const hasLoveKeywords = /cinta aku|ga cinta|kamu cinta|love is|sayang bgt|cantik bgt/i.test(content)

    const isCompliment = /cantik|ganteng|bagus|thank you|terima kasih|amazing/i.test(content)
    const isEmergency = /bahaya|peringatan|alert|danger|ekstrem|waspada/i.test(content)

    for (const [expr, config] of Object.entries(EXPRESSION_CONFIG)) {
        let score = 0
        const reasons: string[] = []

        // 1. Check regex patterns (highest weight: +3)
        for (const pattern of config.triggerPatterns) {
            if (pattern.test(content)) {
                score += 3
                reasons.push('pattern')
                break
            }
        }

        // 2. Check keywords (weight: +2 per match)
        let keywordMatches = 0
        for (const keyword of config.keywords) {
            if (lower.includes(keyword)) {
                keywordMatches++
            }
        }
        if (keywordMatches > 0) {
            score += keywordMatches * 2
            reasons.push(`${keywordMatches}kw`)
        }

        // 3. Check sentiments (weight: +1)
        for (const sentiment of config.sentiments) {
            if (lower.includes(sentiment)) {
                score += 1
                reasons.push('sentiment')
                break
            }
        }

        // 4. Add priority bonus (weight: +0.5 × priority)
        score += config.priority * 0.5

        // 5. CONTEXTUAL PENALTIES & BONUSES

        // ROMANTIC CONTEXT: Strongly boost jatuh_cinta, penalize semangat_success
        if (isRomantic || hasLoveKeywords) {
            if (expr === 'jatuh_cinta') {
                // Massive boost for romantic expressions
                score *= 3.0
                reasons.push('romantic_context')
            } else if (expr === 'semangat_success' && score > 0) {
                // Heavy penalty - don't use success for romance
                score *= 0.3
                reasons.push('suppress_success')
            }
        }

        // Prevent weather expressions dari dominate non-weather chat
        if ((expr === 'hujan' || expr === 'panas' || expr === 'dingin') && !isWeatherTalk && score > 0 && score < 5) {
            score *= 0.4 // Heavy penalty
            reasons.push('weather_penalty')
        }

        // Boost dialog-appropriate expressions
        if ((expr === 'idle_smile' || expr === 'jatuh_cinta' || expr === 'bingung') && isDialogTalk && !isWeatherTalk) {
            if (score > 0) {
                score *= 1.5
                reasons.push('dialog_boost')
            } else if (expr === 'jatuh_cinta' && isRomantic) {
                score = 3 // Minimum score for romantic jatuh_cinta
                reasons.push('romance_fallback')
            }
        }

        // Emergency expressions should be prioritized in emergencies
        if (expr === 'kaget' && isEmergency) {
            score *= 2
            reasons.push('emergency_boost')
        }

        // Compliment context for semangat_success - but NOT if romantic
        if (expr === 'semangat_success' && isCompliment && !isRomantic) {
            score *= 1.5
            reasons.push('compliment_boost')
        }

        if (score > 0) {
            scores.push({
                expression: expr as KiroExpression,
                score,
                reason: reasons.join('+')
            })
        }
    }

    // Sort by score descending dan return top N
    return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}

/**
 * Get best expression match
 */
export function getBestExpressionMatch(content: string): KiroExpression {
    const scores = scoreExpressions(content, 1)
    return scores.length > 0 ? scores[0].expression : 'idle_smile'
}

/**
 * Debug utility untuk melihat scoring
 */
export function debugExpressionScoring(content: string): void {
    const scores = scoreExpressions(content, 10)
    console.table(scores)
}
