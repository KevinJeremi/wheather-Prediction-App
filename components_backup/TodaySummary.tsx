"use client";

import { motion } from 'framer-motion';
import { Droplets, Wind, Eye, Sunrise, Sunset, BarChart3 } from 'lucide-react';

interface TodaySummaryProps {
  summary: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  sunrise: string;
  sunset: string;
}

export function TodaySummary({
  summary,
  maxTemp,
  minTemp,
  condition,
  humidity,
  windSpeed,
  visibility,
  sunrise,
  sunset
}: TodaySummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center">
          <BarChart3 className="text-white" size={20} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Today's Summary
        </h3>
      </div>

      {/* AI Summary */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Temperature Range */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{minTemp}°</span>
          <span className="text-gray-500">/</span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{maxTemp}°</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{condition}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{windSpeed} km/h</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{visibility} km</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sunrise</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{sunrise}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
