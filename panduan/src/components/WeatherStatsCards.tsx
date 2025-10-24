import { Thermometer, Droplets, Wind, CloudRain, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Sparkline } from './Sparkline';

interface WeatherStatsCardsProps {
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  feelsLike: number;
}

export function WeatherStatsCards({ humidity, windSpeed, rainProbability, feelsLike }: WeatherStatsCardsProps) {
  const stats = [
    {
      icon: Thermometer,
      label: 'Feels Like',
      value: `${feelsLike}°C`,
      trend: 'up',
      color: '#FF6B6B',
      sparklineData: [26, 27, 28, 28, 27, 28, 29],
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${humidity}%`,
      trend: 'down',
      color: '#4ECDC4',
      sparklineData: [70, 68, 66, 65, 64, 65, 65],
    },
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${windSpeed} km/h`,
      trend: 'up',
      color: '#95E1D3',
      sparklineData: [8, 9, 10, 11, 12, 12, 13],
    },
    {
      icon: CloudRain,
      label: 'Rain Probability',
      value: `${rainProbability}%`,
      trend: 'down',
      color: '#56CCF2',
      sparklineData: [45, 40, 38, 35, 32, 30, 30],
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

            {/* Mini sparkline chart */}
            <div className="mt-2 flex items-end h-6">
              <Sparkline 
                data={stat.sparklineData} 
                color={stat.color}
                width={80}
                height={20}
              />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}