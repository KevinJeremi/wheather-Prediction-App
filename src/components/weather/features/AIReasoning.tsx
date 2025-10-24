"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useAIWithLocation } from '@/hooks/useAIWithLocation';

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
  forecast?: Array<{
    date?: string
    time?: string
    temp?: number
    minTemp?: number
    maxTemp?: number
    condition?: string
    precipitation?: number
  }>;
}

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
  visibility,
  forecast
}: AIReasoningProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user', content: string, timestamp?: string }>>([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya WeatherGPT, asisten cuaca AI Anda. Saya siap membantu menjawab pertanyaan tentang cuaca, memberikan analisis kondisi, rekomendasi aktivitas, atau sekadar berdiskusi tentang fenomena cuaca. Ada yang bisa saya bantu hari ini?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [responseCount, setResponseCount] = useState(0);

  const { isLoading, error, response, chatWithLocation, clearError } = useAIWithLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll ke pesan terbaru ketika sudah 3 response
  const scrollToBottom = () => {
    if (responseCount >= 3) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, responseCount]);

  // Update messages when response comes from OpenRouter
  useEffect(() => {
    if (response && !isLoading) {
      const aiMessage = {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setResponseCount(prev => prev + 1);
    }
  }, [response, isLoading]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    // Build weather context
    const weatherContext = {
      temperature,
      humidity,
      windSpeed,
      pressure,
      condition,
      precipitation,
      cloudCover,
      uvIndex,
      visibility,
      forecast
    };

    // Send to AI dengan weather data + forecast
    try {
      await chatWithLocation(message, weatherContext);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && message.trim()) {
      handleSendMessage();
    }
  };

  const handleClearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Halo! 👋 Saya WeatherGPT, asisten cuaca AI Anda. Saya siap membantu menjawab pertanyaan tentang cuaca, memberikan analisis kondisi, rekomendasi aktivitas, atau sekadar berdiskusi tentang fenomena cuaca. Ada yang bisa saya bantu hari ini?',
        timestamp: new Date().toISOString()
      }
    ]);
    setResponseCount(0);
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 h-[400px] flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            AI Weather Assistant
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClearConversation}
          disabled={messages.length <= 1 && !message}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>

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
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                  ? 'bg-[#2F80ED] text-white'
                  : 'bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] text-white'
                  }`}>
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
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
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
          placeholder="Tanya tentang cuaca, fenomena alam, atau tips aktivitas..."
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
