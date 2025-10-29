"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle, MapPin, Cloud, Droplets } from 'lucide-react';
import { useAIWithLocation } from '@/hooks/useAIWithLocation';
import { useKiroTyping } from '@/hooks/useKiroExpression';
import { injectLocationToRequest } from '@/services/groqServiceExtension';
import { KiroMascot } from './KiroMascot';
import {
    createOptimizedPrompt,
    validateTokenBudget,
    getQuickResponse,
    shortenMessage
} from '@/services/kiroPromptOptimizer';

interface AIReasoningProps {
    pressure?: number;
    location?: string;
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    precipitation?: number;
    cloudCover?: number;
    uvIndex?: number;
    visibility?: number;
}

/**
 * AIReasoning Component
 * Chat interface for AI Weather Assistant with Weather Context support
 */
export function AIReasoning({
    pressure = 1009,
    location = 'Unknown Location',
    temperature = 25,
    condition = 'Partly Cloudy',
    humidity,
    windSpeed,
    precipitation,
    cloudCover,
    uvIndex,
    visibility
}: AIReasoningProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user', content: string, timestamp?: string }>>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [tokenWarning, setTokenWarning] = useState<string | null>(null);

    const { isLoading, error, response, chatWithLocation, userLocation, isLocationReady, clearError } = useAIWithLocation();
    const kiroExpression = useKiroTyping(); // Hook to manage expression with typing
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Initialize chat with default message (location will be displayed from middleware)
    useEffect(() => {
        if (!isInitialized && isLocationReady) {
            const detectedLocation = userLocation?.name || location;

            // Random fun greetings for variety!
            const funGreetings = [
                `Hello! 👋✨ Kiro here, ready to be your weather buddy!`,
                `Hi there! 🌟 Kiro has arrived! *dramatic entrance* ✨`,
                `Hey! 👋😄 Kiro reporting for duty! What weather info are you looking for today?`,
                `Heyyy! 🤖💙 I missed you! How can I help?`,
            ];

            const randomGreeting = funGreetings[Math.floor(Math.random() * funGreetings.length)];

            const initialMessage = `${randomGreeting}

📍 ${detectedLocation} | 🌡️ ${temperature}°C | ${condition}

I can help you with:
✨ Real-time weather information
🎯 Activity tips based on weather  
💬 Random chat (I love chatting!)
😄 Weather dad jokes (unlimited stock!)

What would you like to know? 😊`;

            setMessages([
                {
                    role: 'assistant',
                    content: initialMessage,
                    timestamp: new Date().toISOString()
                }
            ]);
            setIsInitialized(true);
        }
    }, [isInitialized, isLocationReady, userLocation, location, temperature, condition, pressure]);

    // Auto scroll to latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Update messages when response comes from OpenRouter
    // Use vision analysis for more accurate expression
    useEffect(() => {
        if (response && !isLoading) {
            const aiMessage = {
                role: 'assistant' as const,
                content: response,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Use vision-based expression analysis for better accuracy
            // LLM will see the expression image and choose the appropriate one
            kiroExpression.updateFromContentWithVision(response)
                .catch(err => {
                    console.warn('Vision analysis failed, falling back to text-based:', err);
                    // Fallback to text-based if vision fails
                    kiroExpression.updateFromContent(response, {
                        topic: 'weather',
                        sentiment: 'informative'
                    });
                });
        }
    }, [response, isLoading, kiroExpression]);

    const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;

        // Clear previous warnings
        setTokenWarning(null);

        // Check for quick responses (save API calls)
        const quickReply = getQuickResponse(message);
        if (quickReply) {
            const userMessage = {
                role: 'user' as const,
                content: message,
                timestamp: new Date().toISOString()
            };
            const aiMessage = {
                role: 'assistant' as const,
                content: quickReply,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, userMessage, aiMessage]);

            // Use vision analysis untuk quick reply juga
            kiroExpression.updateFromContentWithVision(quickReply)
                .catch(err => {
                    console.warn('Vision analysis failed for quick reply:', err);
                    kiroExpression.updateFromContent(quickReply);
                });
            setMessage('');
            return;
        }

        // Shorten message jika terlalu panjang
        const processedMessage = shortenMessage(message, 200);

        // Add user message
        const userMessage = {
            role: 'user' as const,
            content: processedMessage,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');

        // Build weather context dari props
        const weatherContext = {
            temperature,
            humidity,
            windSpeed,
            pressure,
            condition,
            precipitation,
            location: userLocation?.name || location
        };

        // Start typing animation
        kiroExpression.startTyping();

        // Create optimized prompt
        const optimizedPrompt = createOptimizedPrompt(processedMessage, weatherContext);

        // Validate token budget
        const validation = validateTokenBudget(optimizedPrompt.estimatedTokens);
        if (!validation.isValid) {
            setTokenWarning(validation.warning || 'Message is too long');
            return;
        }

        // Send to AI dengan location injection + weather data
        try {
            await chatWithLocation(optimizedPrompt.userPrompt, weatherContext);
        } catch (err) {
            kiroExpression.stopTyping('Sorry, there was an error 😢');
            console.error('❌ Failed to send message:', err);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading && message.trim()) {
            handleSendMessage();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 h-[500px] flex flex-col"
        >
            {/* Header dengan Kiro Mascot */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                    {/* Kiro Mascot - Animated */}
                    <div className="relative">
                        <KiroMascot
                            mood={kiroExpression.currentExpression}
                            isTyping={kiroExpression.isTyping}
                            className="w-12 h-12"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                            Kiro
                            <span className="text-xs px-2 py-0.5 bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] text-white rounded-full">
                                AI
                            </span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isLoading ? 'Thinking...' : kiroExpression.isAnalyzing ? 'Analyzing expression...' : 'Smart Weather Assistant'}
                        </p>

                        {/* Expression Info */}
                        {!isLoading && !kiroExpression.isAnalyzing && kiroExpression.confidence > 0 && (
                            <div className="flex items-center gap-2 mt-1 text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {kiroExpression.currentExpression.replace(/_/g, ' ')}
                                    </span>
                                </span>
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {Math.round(kiroExpression.confidence * 100)}% confident
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
                    {kiroExpression.isAnalyzing ? (
                        <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            🤖 Analyzing...
                        </motion.span>
                    ) : (
                        '💚 Ready'
                    )}
                </div>
            </div>

            {/* Expression Detail Tooltip */}
            {!isLoading && !kiroExpression.isAnalyzing && kiroExpression.reason && (
                <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg text-xs text-blue-700 dark:text-blue-300"
                >
                    <span className="font-semibold">✨ </span>
                    {kiroExpression.reason}
                </motion.div>
            )}

            {/* Error Alert */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl flex items-start gap-2"
                >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-xs text-red-600 dark:text-red-400 mt-1 hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Token Warning */}
            {tokenWarning && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-xl flex items-start gap-2"
                >
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{tokenWarning}</p>
                        <button
                            onClick={() => setTokenWarning(null)}
                            className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 hover:underline"
                        >
                            OK
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Messages Container - Hapus scrollbar dengan custom scrolling */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-hide"
                style={{
                    scrollBehavior: 'smooth',
                    msOverflowStyle: 'none',  /* IE and Edge */
                    scrollbarWidth: 'none',   /* Firefox */
                }}
            >
                <style>{`
          /* Chrome, Safari and Opera */
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse gap-2' : ''}`}>
                                {msg.role === 'assistant' ? (
                                    // Kiro avatar untuk AI
                                    <div className="w-8 h-8 flex-shrink-0">
                                        <KiroMascot
                                            message={msg.content}
                                            isTyping={false}
                                            className="w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    // User avatar
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#2F80ED] text-white">
                                        <User className="w-3 h-3" />
                                    </div>
                                )}
                                <div className={`rounded-2xl px-4 py-2 text-sm ${msg.role === 'user'
                                    ? 'bg-[#2F80ED] text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}>
                                    <p className="whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="flex items-start gap-2 max-w-[85%]">
                                {/* Kiro typing animation */}
                                <div className="w-8 h-8 flex-shrink-0">
                                    <KiroMascot
                                        mood="mengetik"
                                        className="w-full h-full"
                                    />
                                </div>
                                <div className="rounded-2xl px-4 py-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 bg-[#2F80ED] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-[#56CCF2] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-[#2F80ED] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Invisible element untuk auto-scroll */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about weather, natural phenomena, or activity tips..."
                    disabled={isLoading}
                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </motion.button>
            </div>
        </motion.div>
    );
}
