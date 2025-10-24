import { useState } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';

interface AIReasoningProps {
  pressure: number;
}

export function AIReasoning({ pressure }: AIReasoningProps) {
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'ai' as const,
      text: `👋 Hello! I'm your weather AI assistant. Based on current atmospheric pressure of ${pressure} hPa, conditions look stable.`,
    },
  ]);

  const handleAsk = () => {
    if (!question.trim()) return;

    // Add user message
    const newMessages = [
      ...messages,
      { type: 'user' as const, text: question },
    ];
    setMessages(newMessages);
    setQuestion('');
    setIsTyping(true);

    // Simulate AI response with typing delay
    const responses = [
      '🌤️ Based on current weather patterns, tomorrow will be sunny with temperatures around 27°C. Perfect for outdoor activities!',
      '⛅ The forecast shows stable conditions with minimal precipitation. You can expect clear skies throughout the day.',
      '🌡️ Temperature trends indicate a gradual warming over the next few days, with peaks around 29°C by midweek.',
      '💨 Wind speeds will remain moderate at 10-15 km/h, coming from the southeast. Ideal sailing conditions.',
    ];

    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        {
          type: 'ai' as const,
          text: responses[Math.floor(Math.random() * responses.length)],
        },
      ]);
    }, 1500);
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden p-[2px]">
      {/* Animated Outer Border */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2F80ED] via-[#56CCF2] to-[#2F80ED]"
        animate={{ 
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Inner Card */}
      <div className="relative flex flex-col w-full h-full rounded-xl border border-white/10 overflow-hidden bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl">
        {/* Inner Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#F4F7FB] via-white to-[#E8F1FA] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 200%" }}
        />

        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#2F80ED]/20 dark:bg-white/10"
            animate={{
              y: ["0%", "-140%"],
              x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
            style={{ left: `${Math.random() * 100}%`, bottom: "-10%" }}
          />
        ))}

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200/50 dark:border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center shadow-lg"
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(47, 128, 237, 0.3)',
                  '0 4px 30px rgba(47, 128, 237, 0.5)',
                  '0 4px 20px rgba(47, 128, 237, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span className="text-lg">🤖</span>
            </motion.div>
            <h2 className="text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-5 py-4 overflow-y-auto space-y-3 text-sm flex flex-col relative z-10 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "px-4 py-3 rounded-2xl max-w-[85%] shadow-md backdrop-blur-md",
                  msg.type === "ai"
                    ? "bg-gray-100/80 dark:bg-white/10 text-gray-800 dark:text-white self-start rounded-tl-sm"
                    : "bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] text-white self-end rounded-tr-sm"
                )}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI Typing Indicator */}
          {isTyping && (
            <motion.div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm max-w-[30%] bg-gray-100/80 dark:bg-white/10 self-start shadow-md backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span 
                className="w-2 h-2 rounded-full bg-gray-400 dark:bg-white"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              />
              <motion.span 
                className="w-2 h-2 rounded-full bg-gray-400 dark:bg-white"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span 
                className="w-2 h-2 rounded-full bg-gray-400 dark:bg-white"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              />
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-t border-gray-200/50 dark:border-white/10 relative z-10">
          <input
            className="flex-1 px-4 py-2.5 text-sm bg-gray-100/80 dark:bg-black/50 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/50 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all"
            placeholder="Ask about weather..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <motion.button
            onClick={handleAsk}
            disabled={!question.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}