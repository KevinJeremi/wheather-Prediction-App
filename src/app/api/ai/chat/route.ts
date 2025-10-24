/**
 * API Route: /api/ai/chat
 * Backend endpoint untuk AI chat
 * 
 * Endpoint ini bisa digunakan untuk:
 * - Hide API key di backend (lebih aman)
 * - Rate limiting
 * - Logging & monitoring
 * - Request validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/services/openrouterService'
import type { ConversationHistory } from '@/types/ai.types'

// Enable runtime
export const runtime = 'nodejs'

// ============================================================
// Type Definitions
// ============================================================

interface ChatRequest {
    message: string
    conversationHistory?: ConversationHistory
}

interface ChatApiResponse {
    success: boolean
    data?: {
        message: string
        timestamp: string
    }
    error?: {
        code: string
        message: string
    }
}

// ============================================================
// Rate Limiting (Simple In-Memory)
// ============================================================

const rateLimitMap = new Map<string, { count: number; reset: number }>()

function checkRateLimit(clientId: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(clientId)

    if (!entry || now > entry.reset) {
        rateLimitMap.set(clientId, { count: 1, reset: now + windowMs })
        return true
    }

    if (entry.count >= limit) {
        return false
    }

    entry.count++
    return true
}

// ============================================================
// Request Validation
// ============================================================

function validateRequest(body: unknown): body is ChatRequest {
    if (!body || typeof body !== 'object') return false

    const req = body as Record<string, unknown>
    if (typeof req.message !== 'string') return false
    if (req.message.trim().length === 0) return false
    if (req.message.length > 2000) return false

    return true
}

// ============================================================
// Handler
// ============================================================

export async function POST(request: NextRequest): Promise<NextResponse<ChatApiResponse>> {
    try {
        // 1. Rate Limiting
        const clientId = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(clientId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'Terlalu banyak request. Coba lagi dalam beberapa detik.',
                    },
                },
                { status: 429 }
            )
        }

        // 2. Parse & Validate Request Body
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
                        message: 'Message harus string dan tidak kosong (max 2000 characters)',
                    },
                },
                { status: 400 }
            )
        }

        // 3. Call AI Service
        const result = await chat(body.message, body.conversationHistory)

        if (!result.success || !result.content) {
            throw new Error(result.error?.message || 'AI service error')
        }

        // 4. Return Success Response
        return NextResponse.json(
            {
                success: true,
                data: {
                    message: result.content,
                    timestamp: new Date().toISOString(),
                },
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[/api/ai/chat] Error:', error)

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

// ============================================================
// OPTIONS Handler (untuk CORS)
// ============================================================

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}
