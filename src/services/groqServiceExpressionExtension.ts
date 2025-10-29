/**
 * Groq Service Extension untuk Expression Detection
 * Menambahkan kemampuan untuk menentukan ekspresi Kiro dari respons AI
 */

import type { AIResponse } from '@/types/ai.types'
import type { KiroExpression, ExpressionResponse } from '@/types/expression.types'
import { analyzeExpression } from '@/services/expressionAnalyzerService'

/**
 * Extended AI Response dengan expression data
 */
export interface AIResponseWithExpression extends AIResponse {
    expression?: KiroExpression
    expressionConfidence?: number
    expressionReason?: string
    _expressionAnalysis?: ExpressionResponse
}

/**
 * Wrap Groq response dengan expression detection
 */
export async function enrichResponseWithExpression(
    response: AIResponse,
    options: {
        useLLM?: boolean
        context?: {
            topic?: string
            sentiment?: string
            userMood?: string
        }
    } = {}
): Promise<AIResponseWithExpression> {
    if (!response.success || !response.content) {
        return {
            ...response,
            expression: 'idle_smile',
            expressionConfidence: 0,
        }
    }

    try {
        const expressionAnalysis = await analyzeExpression(
            response.content,
            options.useLLM ?? true,
            options.context
        )

        return {
            ...response,
            expression: expressionAnalysis.expression,
            expressionConfidence: expressionAnalysis.confidence,
            expressionReason: expressionAnalysis.reason,
            _expressionAnalysis: expressionAnalysis,
        }
    } catch (error) {
        console.error('Error enriching response with expression:', error)
        // Return response with default expression on error
        return {
            ...response,
            expression: 'idle_smile',
            expressionConfidence: 0,
        }
    }
}

/**
 * Batch process multiple responses dengan expression detection
 */
export async function enrichResponsesBatch(
    responses: AIResponse[],
    options: {
        useLLM?: boolean
        context?: {
            topic?: string
            sentiment?: string
            userMood?: string
        }
    } = {}
): Promise<AIResponseWithExpression[]> {
    return Promise.all(
        responses.map(response =>
            enrichResponseWithExpression(response, options)
        )
    )
}

/**
 * Wrap functions untuk auto-inject expression detection
 */
export function createExpressionAwareAPI<T extends (...args: any[]) => Promise<AIResponse>>(
    apiFunction: T,
    options: {
        useLLM?: boolean
        context?: {
            topic?: string
            sentiment?: string
            userMood?: string
        }
    } = {}
): (...args: Parameters<T>) => Promise<AIResponseWithExpression> {
    return async (...args: Parameters<T>): Promise<AIResponseWithExpression> => {
        const response = await apiFunction(...args)
        return enrichResponseWithExpression(response, options)
    }
}
