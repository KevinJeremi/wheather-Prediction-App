"use client";

import { Thermometer, Droplets, Wind, CloudRain, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sparkline } from '@/components/common/Sparkline';
import { useMemo } from 'react';
import type { WeatherDataPoint } from '@/types/weather.types';

interface WeatherStatsCardsProps {
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  feelsLike: number;
  hourlyData?: WeatherDataPoint[];
}

export function WeatherStatsCards({ humidity, windSpeed, rainProbability, feelsLike, hourlyData }: WeatherStatsCardsProps) {
  // Calculate sparkline data from real API hourly data (last 7 hours)
  const sparklineData = useMemo(() => {
    if (!hourlyData || hourlyData.length < 7) {
      // Fallback to current values if no hourly data
      return {
        temperature: [feelsLike, feelsLike, feelsLike, feelsLike, feelsLike, feelsLike, feelsLike],
        humidity: [humidity, humidity, humidity, humidity, humidity, humidity, humidity],
        windSpeed: [windSpeed, windSpeed, windSpeed, windSpeed, windSpeed, windSpeed, windSpeed],
        precipitation: [rainProbability, rainProbability, rainProbability, rainProbability, rainProbability, rainProbability, rainProbability],
      };
    }

    // Get last 7 hours of data
    const last7Hours = hourlyData.slice(0, 7);

    return {
      temperature: last7Hours.map(h => Math.round(h.temperature)),
      humidity: last7Hours.map(h => Math.round(h.humidity)),
      windSpeed: last7Hours.map(h => Math.round(h.windSpeed)),
      precipitation: last7Hours.map(h => Math.round(h.precipitation)),
    };
  }, [hourlyData, feelsLike, humidity, windSpeed, rainProbability]);

  // Calculate trend based on sparkline data
  const calculateTrend = (data: number[]): 'up' | 'down' => {
    if (data.length < 2) return 'up';
    const first = data[0];
    const last = data[data.length - 1];
    return last > first ? 'up' : 'down';
  };

  const stats = [
    {
      icon: Thermometer,
      label: 'Feels Like',
      value: `${feelsLike}°C`,
      trend: calculateTrend(sparklineData.temperature),
      color: '#FF6B6B',
      sparklineData: sparklineData.temperature,
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${humidity}%`,
      trend: calculateTrend(sparklineData.humidity),
      color: '#4ECDC4',
      sparklineData: sparklineData.humidity,
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${windSpeed} km/h`,
      trend: calculateTrend(sparklineData.windSpeed),
      color: '#95E1D3',
      sparklineData: sparklineData.windSpeed,
    },
    {
      icon: CloudRain,
      label: 'Rain Probability',
      value: `${rainProbability}%`,
      trend: calculateTrend(sparklineData.precipitation),
      color: '#56CCF2',
      sparklineData: sparklineData.precipitation,
    },
  ];

  return (
    <>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <motion.div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
                whileHover={{ rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </motion.div>
              <TrendIcon
                className="w-4 h-4"
                style={{ color: stat.trend === 'up' ? '#FF6B6B' : '#4ECDC4' }}
              />
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</p>
              <p className="text-xl text-gray-900 dark:text-white">{stat.value}</p>
            </div>

            <Sparkline
              data={stat.sparklineData}
              color={stat.color}
              showTrend={false}
            />
          </motion.div>
        );
      })}
    </>
  );
}
