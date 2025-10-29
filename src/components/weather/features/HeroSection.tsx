"use client";

import { MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  temp: number;
  location: string;
  localTime: string;
  condition: string;
  aiSummary: string;
}

export function HeroSection({ temp, location, localTime, condition, aiSummary }: HeroSectionProps) {
  const [displayTemp, setDisplayTemp] = useState(0);

  // Count-up animation for temperature
  useEffect(() => {
    let start = 0;
    const end = temp;
    const duration = 1500;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayTemp(end);
        clearInterval(timer);
      } else {
        setDisplayTemp(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [temp]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-visible rounded-3xl bg-gradient-to-br from-[#2F80ED] via-[#3D8FED] to-[#56CCF2] p-6 md:p-8 text-white shadow-[0_8px_32px_rgba(47,128,237,0.3)]"
    >
      {/* Decorative elements with parallax */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transform: 'translate(50%, -50%)' }}
      />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Left: Kiro Mascot - Full Height */}
          <motion.div
            initial={{ scale: 0, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex md:flex-col justify-center md:justify-end items-center flex-shrink-0"
          >
            <div className="relative -mb-6">
              {/* Glow effect behind mascot */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-300 blur-3xl opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Kiro Image - Responsive size */}
              <Image
                src="/maskot/idle_smile.png"
                alt="Kiro Weather Assistant"
                width={160}
                height={200}
                className="relative z-10 drop-shadow-2xl object-contain md:w-[200px] md:h-[250px]"
                priority
              />

              {/* Floating animation */}
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-3 bg-black/10 rounded-full blur-md"
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>

          {/* Center-Right: Temperature and Summary */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Temperature Section */}
              <div>
                {/* Location and Time */}
                <div className="flex flex-col gap-2 mb-4">
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="opacity-90">{location}</span>
                  </motion.div>

                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="opacity-75 text-sm">{localTime}</span>
                  </motion.div>
                </div>

                {/* Temperature - Compact */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-start">
                    <motion.span
                      className="text-6xl md:text-7xl leading-none font-bold"
                      key={displayTemp}
                    >
                      {displayTemp}
                    </motion.span>
                    <div className="flex flex-col ml-2 mt-2">
                      <span className="text-3xl md:text-4xl">°C</span>
                      <span className="text-sm opacity-80 mt-1">{condition}</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* AI Summary Card */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-white/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium opacity-90">AI Weather Assistant</span>
                </div>
                <p className="text-sm leading-relaxed opacity-95">
                  {aiSummary}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
