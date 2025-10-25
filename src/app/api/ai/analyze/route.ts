/**
 * API Route: /api/ai/analyze
 * Endpoint untuk analisis cuaca menggunakan AI
 */

import { NextRequest, NextResponse } from 'next/server'
import { getWeatherAnalysis, generateWeatherRecommendations } from '@/services/groqService'

export const runtime = 'nodejs'

// ============================================================
// Type Definitions
// ============================================================

interface AnalyzeRequest {
    type: 'analysis' | 'recommendation'
    weatherContext: string
    question?: string
    userContext?: string
}

interface AnalyzeApiResponse {
    success: boolean
    data?: {
        analysis: string
        timestamp: string
    }
    error?: {
        code: string
        message: string
    }
}

// ============================================================
// Validation
// ============================================================

function validateRequest(body: unknown): body is AnalyzeRequest {
    if (!body || typeof body !== 'object') return false

    const req = body as Record<string, unknown>

    if (!['analysis', 'recommendation'].includes(req.type as string)) return false
    if (typeof req.weatherContext !== 'string' || req.weatherContext.trim().length === 0) return false
    if (req.question && (typeof req.question !== 'string' || req.question.length > 1000)) return false
    if (req.userContext && (typeof req.userContext !== 'string' || req.userContext.length > 1000)) return false

    return true
}

// ============================================================
// Handler
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeApiResponse>> {
    try {
        // Parse request
        let body: unknown
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_JSON',
                        message: 'Request body harus valid JSON',
                    },
                },
                { status: 400 }
            )
        }

        if (!validateRequest(body)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request parameters',
                    },
                },
                { status: 400 }
            )
        }

        // Call appropriate service
        let result

        if (body.type === 'analysis') {
            result = await getWeatherAnalysis(body.weatherContext, body.question)
        } else {
            result = await generateWeatherRecommendations(body.weatherContext, body.userContext)
        }

        if (!result.success || !result.content) {
            throw new Error(result.error?.message || 'Analysis failed')
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    analysis: result.content,
                    timestamp: new Date().toISOString(),
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[/api/ai/analyze] Error:', error)

        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: errorMessage,
                },
            },
            { status: 500 }
        )
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
