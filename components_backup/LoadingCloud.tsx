"use client";

import { motion } from 'framer-motion';

export function LoadingCloud() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        className="relative"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Cloud */}
        <div className="relative">
          <motion.div 
            className="w-24 h-16 bg-gradient-to-br from-[#BBE1FA] to-[#56CCF2] rounded-full blur-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-2 left-8 w-20 h-12 bg-gradient-to-br from-[#56CCF2] to-[#2F80ED] rounded-full blur-sm"
            animate={{ scale: [1.05, 1, 1.05] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-4 left-4 w-16 h-10 bg-gradient-to-br from-white to-[#BBE1FA] rounded-full blur-sm"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        
        {/* Rain drops */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-3 bg-gradient-to-b from-[#56CCF2] to-transparent rounded-full"
              animate={{ 
                opacity: [0, 1, 0],
                y: [0, 20, 20] 
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2 
              }}
            />
          ))}
        </div>
      </motion.div>
      
      <motion.p
        className="mt-16 text-gray-600 dark:text-gray-300 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading weather data...
      </motion.p>
    </div>
  );
}
