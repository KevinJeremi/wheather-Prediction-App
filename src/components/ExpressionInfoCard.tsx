/**
 * ExpressionInfoCard
 * Menampilkan informasi detail tentang expression yang dipilih
 * Termasuk: nama, confidence, reason, visual indication
 */

'use client'

import { motion } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import type { KiroExpression } from '@/types/expression.types'
import { EXPRESSION_DESCRIPTIONS } from '@/types/expression.types'

interface ExpressionInfoCardProps {
    expression: KiroExpression
    confidence: number
    reason?: string
    showDetails?: boolean
}

/**
 * Card untuk menampilkan expression analysis info
 */
export function ExpressionInfoCard({
    expression,
    confidence,
    reason,
    showDetails = true
}: ExpressionInfoCardProps) {
    // Determine confidence level
    const confidenceLevel = confidence >= 0.85 ? 'high' : confidence >= 0.70 ? 'medium' : 'low'
    const confidenceColor = confidenceLevel === 'high'
        ? 'from-green-400 to-emerald-500'
        : confidenceLevel === 'medium'
            ? 'from-yellow-400 to-orange-500'
            : 'from-orange-400 to-red-500'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-md rounded-2xl p-3 border border-white/30 dark:border-gray-700/30 shadow-lg"
        >
            {/* Expression Name & Confidence */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {expression.replace(/_/g, ' ').charAt(0).toUpperCase() + expression.replace(/_/g, ' ').slice(1)}
                        </h4>
                        {confidenceLevel === 'high' && (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                        {EXPRESSION_DESCRIPTIONS[expression]}
                    </p>
                </div>

                {/* Confidence Badge */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${confidenceColor} flex-shrink-0`}
                >
                    {Math.round(confidence * 100)}%
                </motion.div>
            </div>

            {/* Confidence Bar */}
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${confidenceColor}`}
                />
            </div>

            {/* Reason if available */}
            {showDetails && reason && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        <span className="font-semibold">✨ </span>
                        {reason}
                    </p>
                </motion.div>
            )}

            {/* Confidence Level Indicator */}
            {showDetails && (
                <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-500">Confidence:</span>
                    <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: confidence > (i + 1) / 3 ? 1 : 0.3 }}
                                transition={{ delay: i * 0.1 }}
                                className={`w-1 h-3 rounded-full ${confidence > (i + 1) / 3
                                        ? confidenceLevel === 'high'
                                            ? 'bg-green-500'
                                            : confidenceLevel === 'medium'
                                                ? 'bg-yellow-500'
                                                : 'bg-orange-500'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    )
}

/**
 * Inline Expression Info - Lebih compact untuk header
 */
export function ExpressionInfoInline({
    expression,
    confidence,
    reason
}: ExpressionInfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-xs"
        >
            {/* Expression name */}
            <span className="font-semibold text-gray-700 dark:text-gray-300">
                {expression.replace(/_/g, ' ')}
            </span>

            {/* Divider */}
            <span className="text-gray-400 dark:text-gray-500">•</span>

            {/* Confidence */}
            <span className="text-gray-600 dark:text-gray-400">
                {Math.round(confidence * 100)}% confident
            </span>

            {/* Reason icon */}
            {reason && (
                <>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-gray-600 dark:text-gray-400 line-clamp-1">
                        {reason.substring(0, 30)}...
                    </span>
                </>
            )}
        </motion.div>
    )
}

/**
 * Expression Comparison - Untuk debug/testing
 */
export function ExpressionComparison({
    expressions
}: {
    expressions: Array<{ expression: KiroExpression; confidence: number; reason?: string }>
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
        >
            {expressions.map((exp, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                    {/* Rank */}
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-5">
                        #{idx + 1}
                    </span>

                    {/* Expression name */}
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                        {exp.expression}
                    </span>

                    {/* Confidence bar */}
                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${exp.confidence * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                        />
                    </div>

                    {/* Confidence value */}
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-10 text-right">
                        {Math.round(exp.confidence * 100)}%
                    </span>
                </motion.div>
            ))}
        </motion.div>
    )
}

/**
 * Expression Status Badge - Untuk quick status
 */
export function ExpressionStatusBadge({
    expression,
    confidence,
    isAnalyzing = false
}: {
    expression: KiroExpression
    confidence: number
    isAnalyzing?: boolean
}) {
    if (isAnalyzing) {
        return (
            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
            >
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    🤖 Analyzing...
                </span>
            </motion.div>
        )
    }

    const isHighConfidence = confidence >= 0.80

    return (
        <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${isHighConfidence
                    ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
                }`}
        >
            {isHighConfidence ? (
                <>
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        {expression} • {Math.round(confidence * 100)}%
                    </span>
                </>
            ) : (
                <>
                    <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        {expression} • {Math.round(confidence * 100)}%
                    </span>
                </>
            )}
        </motion.div>
    )
}
