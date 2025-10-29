/**
 * Hook to manage Kiro mascot expression
 * Automatically detect and update expression based on AI response
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { KiroExpression, ExpressionResponse } from '@/types/expression.types'
import { analyzeExpression } from '@/services/expressionAnalyzerService'

interface UseKiroExpressionOptions {
    useLLM?: boolean // Use LLM for detection, default true
    autoDetect?: boolean // Auto-detect from content, default true
    defaultExpression?: KiroExpression
}

interface UseKiroExpressionReturn {
    currentExpression: KiroExpression
    isAnalyzing: boolean
    confidence: number
    reason?: string
    setExpression: (expression: KiroExpression) => void
    updateFromContent: (content: string, context?: {
        topic?: string
        sentiment?: string
        userMood?: string
    }) => Promise<void>
    updateFromContentWithVision: (content: string) => Promise<void>
}

export function useKiroExpression(
    options: UseKiroExpressionOptions = {}
): UseKiroExpressionReturn {
    const {
        useLLM = true,
        autoDetect = true,
        defaultExpression = 'idle_smile'
    } = options

    const [currentExpression, setCurrentExpressionState] = useState<KiroExpression>(defaultExpression)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [confidence, setConfidence] = useState<number>(0)
    const [reason, setReason] = useState<string>()

    /**
     * Update expression from complete expression response
     */
    const updateExpressionFromResponse = useCallback((response: ExpressionResponse) => {
        setCurrentExpressionState(response.expression)
        setConfidence(response.confidence)
        setReason(response.reason)
    }, [])

    /**
     * Set expression secara manual
     */
    const setExpression = useCallback((expression: KiroExpression) => {
        setCurrentExpressionState(expression)
        setConfidence(1.0) // Manual setting = high confidence
        setReason('Manually set')
    }, [])

    /**
     * Update expression from AI response content
     */
    const updateFromContent = useCallback(async (
        content: string,
        context?: {
            topic?: string
            sentiment?: string
            userMood?: string
        }
    ) => {
        if (!autoDetect || !content) return

        setIsAnalyzing(true)
        try {
            const response = await analyzeExpression(content, useLLM, context)
            updateExpressionFromResponse(response)
        } catch (error) {
            console.error('Error analyzing expression:', error)
        } finally {
            setIsAnalyzing(false)
        }
    }, [autoDetect, useLLM, updateExpressionFromResponse])

    /**
     * Update expression from AI response content with vision analysis
     * This will send to API that uses vision to analyze expression image
     */
    const updateFromContentWithVision = useCallback(async (
        content: string
    ) => {
        if (!content) return

        setIsAnalyzing(true)
        try {
            const response = await fetch('/api/ai/analyze-expression', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content,
                    mode: 'analyze' // Gunakan vision analysis
                })
            })

            if (!response.ok) {
                throw new Error('Failed to analyze expression')
            }

            const result = await response.json()
            updateExpressionFromResponse(result)
        } catch (error) {
            console.error('Error in vision expression analysis:', error)
            // Fallback ke text-based analysis
            await updateFromContent(content)
        } finally {
            setIsAnalyzing(false)
        }
    }, [updateFromContent, updateExpressionFromResponse])

    return {
        currentExpression,
        isAnalyzing,
        confidence,
        reason,
        setExpression,
        updateFromContent,
        updateFromContentWithVision
    }
}

/**
 * Hook for typing indicator + expression transition
 */
export function useKiroTyping() {
    const expression = useKiroExpression({ defaultExpression: 'mengetik' })
    const [isTyping, setIsTyping] = useState(false)

    useEffect(() => {
        if (isTyping) {
            expression.setExpression('mengetik')
        }
    }, [isTyping, expression])

    const startTyping = useCallback(() => {
        setIsTyping(true)
    }, [])

    const stopTyping = useCallback(async (content: string) => {
        setIsTyping(false)
        // Auto-detect expression from content after typing is done
        await expression.updateFromContent(content)
    }, [expression])

    return {
        ...expression,
        isTyping,
        startTyping,
        stopTyping
    }
}

/**
 * Hook to manage expression transition with delay
 */
export function useKiroExpressionTransition(delayMs: number = 500) {
    const expression = useKiroExpression()
    const [pendingExpression, setPendingExpression] = useState<KiroExpression | null>(null)

    useEffect(() => {
        if (!pendingExpression) return

        const timer = setTimeout(() => {
            expression.setExpression(pendingExpression)
            setPendingExpression(null)
        }, delayMs)

        return () => clearTimeout(timer)
    }, [pendingExpression, delayMs, expression])

    const transitionTo = useCallback((nextExpression: KiroExpression) => {
        setPendingExpression(nextExpression)
    }, [])

    return {
        ...expression,
        transitionTo
    }
}
