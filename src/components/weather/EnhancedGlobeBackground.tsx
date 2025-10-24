"use client";

import { motion } from 'framer-motion';
import { COBEOptions } from 'cobe';

interface EnhancedGlobeBackgroundProps {
  isDark: boolean;
}

export function EnhancedGlobeBackground({ isDark }: EnhancedGlobeBackgroundProps) {
  // Globe config based on theme
  const getGlobeConfig = (): COBEOptions => {
    if (isDark) {
      return {
        width: 800,
        height: 800,
        onRender: () => {},
        devicePixelRatio: 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.18, 0.31, 0.54], // Sky blue tint
        markerColor: [0.18, 0.5, 0.93], // #2F80ED
        glowColor: [0.34, 0.8, 0.95], // #56CCF2
        markers: [
          { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo
          { location: [34.6937, 135.5022], size: 0.05 }, // Osaka
          { location: [43.0642, 141.3469], size: 0.04 }, // Sapporo
          { location: [35.0116, 135.7681], size: 0.03 }, // Kyoto
          { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
          { location: [-6.2088, 106.8456], size: 0.06 }, // Jakarta
          { location: [40.7128, -74.006], size: 0.07 }, // New York
          { location: [51.5074, -0.1278], size: 0.06 }, // London
        ],
      };
    } else {
      return {
        width: 800,
        height: 800,
        onRender: () => {},
        devicePixelRatio: 2,
        phi: 0,
        theta: 0.3,
        dark: 0,
        diffuse: 0.8,
        mapSamples: 16000,
        mapBrightness: 2,
        baseColor: [0.85, 0.92, 0.98], // Light sky blue
        markerColor: [0.18, 0.5, 0.93], // #2F80ED
        glowColor: [0.73, 0.88, 0.98], // #BBE1FA
        markers: [
          { location: [35.6762, 139.6503], size: 0.08 }, // Tokyo
          { location: [34.6937, 135.5022], size: 0.05 }, // Osaka
          { location: [43.0642, 141.3469], size: 0.04 }, // Sapporo
          { location: [35.0116, 135.7681], size: 0.03 }, // Kyoto
          { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
          { location: [-6.2088, 106.8456], size: 0.06 }, // Jakarta
          { location: [40.7128, -74.006], size: 0.07 }, // New York
          { location: [51.5074, -0.1278], size: 0.06 }, // London
        ],
      };
    }
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient orbs in background - pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none">
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

      {/* Globe container - pointer-events enabled for interaction */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-7xl mx-auto pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] md:max-w-[1400px] pointer-events-auto opacity-25 dark:opacity-35 scale-110 md:scale-125">
            {/* Globe placeholder - replace with actual Globe component when available */}
            <div className="w-full aspect-square bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full" />
          </div>
          
          {/* Gradient overlay to blend with content - pointer-events-none */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/60 dark:to-black/60 pointer-events-none" />
        </div>
      </div>

      {/* Subtle grid pattern overlay - pointer-events-none */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(47, 128, 237, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47, 128, 237, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}
