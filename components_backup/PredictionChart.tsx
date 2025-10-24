"use client";

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { CombinedWeatherData } from '@/types/weather.types';

interface PredictionChartProps {
  weatherData?: CombinedWeatherData | null;
}

export function PredictionChart({ weatherData }: PredictionChartProps) {
  // Use real data if available, otherwise mock data
  const data = weatherData
    ? weatherData.hourly.slice(0, 24).map((hour, idx) => ({
      time: new Date(hour.time).getHours().toString().padStart(2, '0') + ':00',
      temp: Math.round(hour.temperature),
    }))
    : [
      { time: '00:00', temp: 21 },
      { time: '04:00', temp: 19 },
      { time: '08:00', temp: 22 },
      { time: '12:00', temp: 26 },
      { time: '16:00', temp: 28 },
      { time: '20:00', temp: 24 },
      { time: '00:00', temp: 20 },
    ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Temperature Forecast
        </h3>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-xs rounded-lg bg-[#2F80ED]/10 text-[#2F80ED] font-medium">
            24H
          </button>
          <button className="px-3 py-1 text-xs rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            7D
          </button>
          <button className="px-3 py-1 text-xs rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
            30D
          </button>
        </div>
      </div>

      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2F80ED" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#2F80ED"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#tempGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
