/**
 * API route untuk expression analysis dengan vision
 * POST /api/ai/analyze-expression
 */

import { analyzeAllExpressionsWithVision, validateExpressionWithVision } from '@/services/expressionVisionService'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { content, mode = 'analyze' } = body

        if (!content) {
            return Response.json(
                { error: 'Content is required' },
                { status: 400 }
            )
        }

        if (mode === 'analyze') {
            // Analyze dengan vision - pilih ekspresi terbaik berdasarkan gambar
            const result = await analyzeAllExpressionsWithVision(content)
            return Response.json(result)
        } else if (mode === 'validate') {
            // Validate ekspresi tertentu
            const { expression } = body
            if (!expression) {
                return Response.json(
                    { error: 'Expression is required for validation mode' },
                    { status: 400 }
                )
            }

            const result = await validateExpressionWithVision(expression, content)
            return Response.json(result)
        } else {
            return Response.json(
                { error: 'Invalid mode. Use "analyze" or "validate"' },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error('Expression analysis error:', error)
        return Response.json(
            {
                error: 'Failed to analyze expression',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}
