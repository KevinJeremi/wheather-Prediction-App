"use client";

import { motion } from 'framer-motion';
import { Wind, Sun, Sunrise, Sunset } from 'lucide-react';

interface EnvironmentalInsightsProps {
  airQuality?: {
    aqi: number
    aqiLevel: string
    pm25: number
  }
  visibility?: {
    valueKm: number
  }
  uvIndex: number
  sunrise: string
  sunset: string
}

export function EnvironmentalInsights({
  airQuality,
  visibility,
  uvIndex,
  sunrise,
  sunset
}: EnvironmentalInsightsProps) {
  const getAirQualityLevel = (level: string) => {
    const levelMap: Record<string, { color: string; bgColor: string }> = {
      'Good': { color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/20' },
      'Moderate': { color: 'yellow', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' },
      'Unhealthy for Sensitive': { color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
      'Unhealthy': { color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/20' },
      'Very Unhealthy': { color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
      'Hazardous': { color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/20' },
    }
    return levelMap[level] || { color: 'gray', bgColor: 'bg-gray-100 dark:bg-gray-900/20' }
  };

  const getUVLevel = (value: number) => {
    if (value <= 2) return { level: 'Low', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    if (value <= 5) return { level: 'Moderate', color: 'yellow', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    if (value <= 7) return { level: 'High', color: 'orange', bgColor: 'bg-orange-100 dark:bg-orange-900/20' };
    if (value <= 10) return { level: 'Very High', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    return { level: 'Extreme', color: 'purple', bgColor: 'bg-purple-100 dark:bg-purple-900/20' };
  };

  const uvInfo = getUVLevel(uvIndex);
  const airQualityInfo = airQuality ? getAirQualityLevel(airQuality.aqiLevel) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Wind className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Environmental Insights
        </h3>
      </div>

      <div className="space-y-4">
        {/* Air Quality */}
        {airQuality && airQualityInfo && (
          <div className={`p-3 rounded-xl ${airQualityInfo.bgColor} border border-white/20 dark:border-gray-700/20`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Air Quality Index</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {airQuality.aqiLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-red-600"
                  style={{ width: `${Math.min(100, (airQuality.aqi / 500) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                {airQuality.aqi}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">PM2.5:</span>
                <span className="ml-1 font-medium text-gray-900 dark:text-white">{airQuality.pm25.toFixed(1)} µg/m³</span>
              </div>
            </div>
          </div>
        )}

        {/* Visibility */}
        {visibility && (
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Visibility</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {visibility.valueKm.toFixed(1)} km
                </span>
              </div>
            </div>
          </div>
        )}

        {/* UV Index */}
        <div className={`p-3 rounded-xl ${uvInfo.bgColor} border border-white/20 dark:border-gray-700/20`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">UV Index</span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {uvInfo.level}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-red-600"
                style={{ width: `${Math.min(100, (uvIndex / 11) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-right">
              {uvIndex}
            </span>
          </div>
        </div>

        {/* Sun Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-indigo-100 dark:from-orange-900/20 dark:to-indigo-900/20 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-2 mb-1">
              <Sunrise className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Sunrise</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{sunrise}</span>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-2 mb-1">
              <Sunset className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Sunset</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{sunset}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
