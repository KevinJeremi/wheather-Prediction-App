"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useAI } from '@/hooks/useAI';

interface AIReasoningProps {
  pressure?: number;
  location?: string;
  temperature?: number;
  condition?: string;
}

export function AIReasoning({
  pressure = 1009,
  location = 'Unknown Location',
  temperature = 25,
  condition = 'Partly Cloudy'
}: AIReasoningProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user', content: string, timestamp?: string }>>([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya WeatherGPT, asisten cuaca AI Anda. Saya siap membantu menjawab pertanyaan tentang cuaca, memberikan analisis kondisi, dan rekomendasi aktivitas. Ada yang bisa saya bantu?',
      timestamp: new Date().toISOString()
    }
  ]);

  const { isLoading, error, response, chat, clearError } = useAI();

  // Update messages when response comes from OpenRouter
  useEffect(() => {
    if (response && !isLoading) {
      const aiMessage = {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
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

    // Send to AI
    try {
      await chat(message);
    } catch (err) {
      console.error('Failed to send message:', err);
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
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 h-[400px] flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          AI Weather Assistant
        </h3>
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
                  {msg.content}
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
                <div className="rounded-2xl px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Section */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tanya tentang cuaca..."
          disabled={isLoading}
          className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
