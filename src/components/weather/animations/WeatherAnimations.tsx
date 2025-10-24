"use client";

import { motion } from 'framer-motion';

interface WeatherAnimationsProps {
  condition: string;
  isDark: boolean;
}

export function WeatherAnimations({ condition, isDark }: WeatherAnimationsProps) {
  // Only show animations for certain conditions
  if (!condition.toLowerCase().includes('rain') && !condition.toLowerCase().includes('snow') && !condition.toLowerCase().includes('cloud')) {
    return null;
  }

  // Rain animation
  if (condition.toLowerCase().includes('rain')) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-5">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-8 bg-gradient-to-b from-blue-400/60 to-transparent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, window.innerHeight + 20],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1 + Math.random() * 1,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  // Snow animation
  if (condition.toLowerCase().includes('snow')) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-5">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/80 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, window.innerHeight + 20],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  // Cloud animation
  if (condition.toLowerCase().includes('cloud')) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-5">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-12 bg-white/20 rounded-full blur-xl"
            style={{
              left: `${-10 + Math.random() * 120}%`,
              top: `${Math.random() * 50}%`,
            }}
            animate={{
              x: [0, window.innerWidth + 100],
              opacity: [0, 0.3, 0.3, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
