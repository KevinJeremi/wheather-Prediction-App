"use client";

import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface WeatherBackgroundProps {
  condition: string;
  isDark: boolean;
}

// Generate stars once outside component to avoid hydration mismatch
const generateStarPositions = () => {
  const stars = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      id: i,
      left: (i * 2.0) % 100,
      top: (i * 1.9) % 100,
    });
  }
  return stars;
};

const STAR_POSITIONS = generateStarPositions();

export function WeatherBackground({ condition, isDark }: WeatherBackgroundProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hour = new Date().getHours();

  // Determine time of day
  const isNight = hour < 6 || hour >= 20;

  // Background base color based on mode
  const getBaseColor = () => {
    if (isDark) {
      return '#0a0e1a';
    }
    return '#f8fafc';
  };

  // Simple gradient background instead of globe
  const getGradient = () => {
    if (isDark) {
      return 'linear-gradient(135deg, rgba(10,14,26,1) 0%, rgba(20,30,48,1) 50%, rgba(30,40,60,1) 100%)';
    } else {
      return 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(226,232,240,1) 50%, rgba(203,213,225,1) 100%)';
    }
  };

  return (
    <>
      {/* Base gradient background */}
      <div
        className="fixed inset-0 -z-10 transition-all duration-1000"
        style={{ background: getGradient() }}
      />

      {/* Decorative gradient orbs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#2F80ED]/10 dark:bg-[#2F80ED]/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-[#56CCF2]/10 dark:bg-[#56CCF2]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#BBE1FA]/10 dark:bg-[#BBE1FA]/15 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Stars for night time */}
      {(isNight || isDark) && isClient && (
        <div className="fixed inset-0 -z-10">
          {STAR_POSITIONS.map((star) => (
            <motion.div
              key={star.id}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
