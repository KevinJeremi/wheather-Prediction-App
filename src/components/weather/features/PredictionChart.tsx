"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { useState, useMemo } from 'react';
import type { CombinedWeatherData } from '@/types/weather.types';

interface PredictionChartProps {
  weatherData?: CombinedWeatherData | null;
}

type ForecastRange = '24H' | '7D' | '16D';

export function PredictionChart({ weatherData }: PredictionChartProps) {
  const [selectedRange, setSelectedRange] = useState<ForecastRange>('24H');

  // Process data berdasarkan selected range
  const chartData = useMemo(() => {
    if (!weatherData) {
      // Mock data for demo
      return {
        '24H': Array.from({ length: 24 }, (_, i) => ({
          time: `${String(i).padStart(2, '0')}:00`,
          temp: Math.round(20 + Math.sin(i / 4) * 8),
          minTemp: Math.round(18 + Math.sin(i / 4) * 8),
          maxTemp: Math.round(22 + Math.sin(i / 4) * 8),
        })),
        '7D': Array.from({ length: 7 }, (_, i) => ({
          date: `Day ${i + 1}`,
          temp: Math.round(22 + Math.sin(i / 3) * 6),
          minTemp: Math.round(18 + Math.sin(i / 3) * 6),
          maxTemp: Math.round(26 + Math.sin(i / 3) * 6),
        })),
        '16D': Array.from({ length: 16 }, (_, i) => ({
          date: `${i + 1}`,
          temp: Math.round(22 + Math.sin(i / 10) * 8),
          minTemp: Math.round(18 + Math.sin(i / 10) * 8),
          maxTemp: Math.round(26 + Math.sin(i / 10) * 8),
        })),
      };
    }

    // Process real JMA data
    const hourlyData = weatherData.hourly || [];
    const dailyData = weatherData.daily || [];

    return {
      '24H': hourlyData.slice(0, 24).map((hour) => ({
        time: new Date(hour.time).getHours().toString().padStart(2, '0') + ':00',
        temp: Math.round(hour.temperature),
        humidity: hour.humidity,
      })),
      '7D': dailyData.slice(0, 7).map((day, idx) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        temp: Math.round((day.temperatureMax + day.temperatureMin) / 2),
        minTemp: Math.round(day.temperatureMin),
        maxTemp: Math.round(day.temperatureMax),
      })),
      '16D': dailyData.slice(0, 16).map((day, idx) => ({
        date: new Date(day.date).getDate().toString(),
        temp: Math.round((day.temperatureMax + day.temperatureMin) / 2),
        minTemp: Math.round(day.temperatureMin),
        maxTemp: Math.round(day.temperatureMax),
      })),
    };
  }, [weatherData]);

  const currentData = chartData[selectedRange];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-3 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data.time || data.date || 'Data'}
          </p>
          {data.temp !== undefined && (
            <p className="text-sm text-[#2F80ED] font-semibold">
              {data.temp}°C
            </p>
          )}
          {data.minTemp !== undefined && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Low: {data.minTemp}°C
            </p>
          )}
          {data.maxTemp !== undefined && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              High: {data.maxTemp}°C
            </p>
          )}
          {data.humidity !== undefined && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Humidity: {Math.round(data.humidity)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 w-full overflow-hidden"
    >
      {/* Header dengan time range selector */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex-shrink-0">
          Temperature Forecast
        </h3>
        <div className="flex gap-2 flex-shrink-0">
          {(['24H', '7D', '16D'] as const).map((range) => (
            <motion.button
              key={range}
              onClick={() => setSelectedRange(range)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${selectedRange === range
                ? 'bg-[#2F80ED]/15 text-[#2F80ED] border border-[#2F80ED]/30'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Area - Full responsive container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRange}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full h-auto"
          style={{ minHeight: '300px', maxHeight: '500px' }}
        >
          <ResponsiveContainer width="100%" height={300} debounce={100}>
            <AreaChart
              data={currentData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2F80ED" stopOpacity={0.01} />
                </linearGradient>
                {selectedRange !== '24H' && (
                  <>
                    <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#56CCF2" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#56CCF2" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                    </linearGradient>
                  </>
                )}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0, 0, 0, 0.05)"
                vertical={true}
              />
              <XAxis
                dataKey={selectedRange === '24H' ? 'time' : 'date'}
                stroke="rgba(107, 114, 128, 0.5)"
                fontSize={12}
                tick={{ fill: 'currentColor', fontSize: 11 }}
                interval={selectedRange === '24H' ? 2 : selectedRange === '7D' ? 0 : 2}
                angle={selectedRange === '16D' ? -45 : 0}
                textAnchor={selectedRange === '16D' ? 'end' : 'middle'}
                height={selectedRange === '16D' ? 60 : 30}
              />
              <YAxis
                stroke="rgba(107, 114, 128, 0.5)"
                fontSize={12}
                tick={{ fill: 'currentColor', fontSize: 11 }}
                width={50}
                label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Main temperature line */}
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#2F80ED"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tempGradient)"
                dot={selectedRange !== '24H' ? { fill: '#2F80ED', r: 4 } : false}
                activeDot={{ r: 6 }}
              />

              {/* Min/Max temperature untuk 7D dan 30D */}
              {selectedRange !== '24H' && (
                <>
                  <Area
                    type="monotone"
                    dataKey="minTemp"
                    stroke="#56CCF2"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fillOpacity={0.5}
                    fill="url(#minGradient)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="maxTemp"
                    stroke="#FF6B6B"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    fillOpacity={0.5}
                    fill="url(#maxGradient)"
                    dot={false}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-6 pt-4 border-t border-white/20 dark:border-gray-700/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2F80ED] flex-shrink-0"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Average Temp</span>
        </div>
        {selectedRange !== '24H' && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-[#56CCF2] flex-shrink-0"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Min</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-[#FF6B6B] flex-shrink-0"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Max</span>
            </div>
          </>
        )}

      </div>
    </motion.div>
  );
}
