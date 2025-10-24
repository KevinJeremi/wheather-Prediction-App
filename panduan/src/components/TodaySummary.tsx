import { motion } from 'motion/react';
import { Sunrise, Sunset, Wind, Droplets, Eye } from 'lucide-react';

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
  const getConditionEmoji = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('clear') || c.includes('sunny')) return '☀️';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('rain')) return '🌧️';
    if (c.includes('storm') || c.includes('thunder')) return '⛈️';
    if (c.includes('snow')) return '❄️';
    if (c.includes('fog') || c.includes('mist')) return '🌫️';
    return '🌤️';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-gray-900 dark:text-white mb-1">Today's Summary</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">What to expect today</p>
        </div>
        <motion.div
          className="text-5xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          {getConditionEmoji(condition)}
        </motion.div>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-[#2F80ED]/10 to-[#56CCF2]/10 dark:from-[#2F80ED]/20 dark:to-[#56CCF2]/20 rounded-2xl p-4 mb-4 border border-[#2F80ED]/20">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Temperature Range */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">High</div>
          <div className="text-2xl text-orange-500 dark:text-orange-400">{maxTemp}°</div>
        </div>
        <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
        <div className="flex-1">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Low</div>
          <div className="text-2xl text-blue-500 dark:text-blue-400">{minTemp}°</div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 rounded-xl p-3">
          <Sunrise className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sunrise</div>
            <div className="text-sm text-gray-900 dark:text-white">{sunrise}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 rounded-xl p-3">
          <Sunset className="w-4 h-4 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sunset</div>
            <div className="text-sm text-gray-900 dark:text-white">{sunset}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 rounded-xl p-3">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Humidity</div>
            <div className="text-sm text-gray-900 dark:text-white">{humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-700/40 rounded-xl p-3">
          <Wind className="w-4 h-4 text-teal-500" />
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Wind</div>
            <div className="text-sm text-gray-900 dark:text-white">{windSpeed} km/h</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}