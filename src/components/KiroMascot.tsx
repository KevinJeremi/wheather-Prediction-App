"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { KiroExpression } from '@/types/expression.types'
import { scoreExpressions } from '@/services/expressionConfig';

type KiroMood = KiroExpression;

interface KiroMascotProps {
    mood?: KiroMood;
    message?: string;
    isTyping?: boolean;
    className?: string;
}

/**
 * Komponen Maskot Kiro dengan animasi smooth
 * Menampilkan ekspresi sesuai context dan mood
 */
export function KiroMascot({
    mood = 'idle_smile',
    message = '',
    isTyping = false,
    className = ''
}: KiroMascotProps) {
    const [currentMood, setCurrentMood] = useState<KiroMood>(mood);
    const [isVisible, setIsVisible] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (isTyping) {
            setCurrentMood('mengetik');
        } else {
            // Auto detect mood dari message content
            const detectedMood = detectMoodFromMessage(message);
            setCurrentMood(detectedMood || mood);
        }
    }, [isTyping, message, mood]);

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key={currentMood}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1] // Spring-like easing
                    }}
                    className={`relative ${className} group`}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    {/* Breathing animation wrapper */}
                    <motion.div
                        animate={{
                            scale: currentMood === 'mengetik'
                                ? [1, 1.05, 1]
                                : [1, 1.02, 1],
                        }}
                        transition={{
                            duration: currentMood === 'mengetik' ? 1 : 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative"
                    >
                        {/* Glow effect untuk mood tertentu */}
                        {(currentMood === 'semangat_success' || currentMood === 'kaget') && (
                            <motion.div
                                className="absolute inset-0 rounded-full blur-2xl opacity-40"
                                style={{
                                    background: currentMood === 'semangat_success'
                                        ? 'radial-gradient(circle, #4ECDC4 0%, transparent 70%)'
                                        : 'radial-gradient(circle, #FF6B6B 0%, transparent 70%)'
                                }}
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}

                        {/* Maskot Image */}
                        <Image
                            src={`/maskot/${getMascotImage(currentMood)}`}
                            alt={`Kiro - ${currentMood}`}
                            width={120}
                            height={120}
                            className="relative z-10 drop-shadow-lg"
                            priority
                        />

                        {/* Floating animation untuk idle */}
                        {currentMood === 'idle_smile' && (
                            <motion.div
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/10 rounded-full blur-sm"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.2, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                    </motion.div>

                    {/* Typing indicator dots saat mengetik */}
                    {currentMood === 'mengetik' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-[#2F80ED] rounded-full"
                                    animate={{
                                        y: [-2, 2, -2],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* Tooltip - Expression name on hover */}
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg"
                        >
                            {currentMood.replace(/_/g, ' ')}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Mapping mood ke nama file gambar
 */
function getMascotImage(mood: KiroMood): string {
    const imageMap: Partial<Record<KiroMood, string>> = {
        'idle_smile': 'idle_smile.png',
        'berpikir': 'berpikir.png',
        'mengetik': 'mengetik.png',
        'semangat_success': 'semangat success.png',
        'hujan': 'hujan.png',
        'panas': 'panas.png',
        'dingin': 'dingin.png',
        'kaget': 'kaget.png',
        'maaf': 'maaf.png',
        'thinking2': 'thinking2.png',
        'penakluk_hujan': 'penakluk_hujan.png',
        'sedih': 'sedih.png',
        'takut': 'takut.png',
        'marah': 'marah.png',
        'malu': 'malu.png',
        'jatuh_cinta': 'jatuh_cinta.png',
        'pray': 'pray.png',
        'da': 'da.png',
        'bingung': 'bingung.png',
    };

    return imageMap[mood] || 'idle_smile.png';
}

/**
 * Deteksi mood dari content message AI
 * Menggunakan sistem scoring sophisticated dari expressionConfig
 * Dengan randomization untuk variety & flexibility! 🎭
 */
function detectMoodFromMessage(message: string): KiroMood {
    if (!message) return 'idle_smile';

    try {
        // Gunakan scoreExpressions yang sophisticated
        const topMatches = scoreExpressions(message, 5);

        if (topMatches.length === 0) {
            return 'idle_smile';
        }

        // Get top match
        const topMatch = topMatches[0];

        // If top match has strong confidence, use it directly (>= 4 score)
        if (topMatch.score >= 4) {
            return topMatch.expression;
        }

        // If multiple candidates exist, add randomization for variety
        // This prevents the same mood from appearing repeatedly
        if (topMatches.length > 1) {
            // 70% untuk top match, 20% untuk second, 10% untuk third
            const randomValue = Math.random();

            if (randomValue < 0.7) {
                return topMatches[0].expression;
            } else if (randomValue < 0.9) {
                return topMatches[1].expression;
            } else if (topMatches[2]) {
                return topMatches[2].expression;
            }
        }

        // Default ke top match
        return topMatch.expression;
    } catch (error) {
        console.error('Error detecting mood from message:', error);
        return 'idle_smile';
    }
}