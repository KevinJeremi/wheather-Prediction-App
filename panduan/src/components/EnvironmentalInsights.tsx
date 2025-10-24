import { Sunrise, Sunset, Wind as AirQuality, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface EnvironmentalInsightsProps {
  airQuality: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
}

export function EnvironmentalInsights({ airQuality, uvIndex, sunrise, sunset }: EnvironmentalInsightsProps) {
  const getAirQualityLabel = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const getUVLabel = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-500' };
    if (uv <= 7) return { label: 'High', color: 'text-orange-500' };
    return { label: 'Very High', color: 'text-red-500' };
  };

  const aqInfo = getAirQualityLabel(airQuality);
  const uvInfo = getUVLabel(uvIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/30"
    >
      <h3 className="mb-3 text-gray-900 dark:text-white text-sm">Environmental</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Air Quality */}
        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50">
          <div className={`w-8 h-8 rounded-lg ${aqInfo.bg} flex items-center justify-center mb-2`}>
            <AirQuality className={`w-4 h-4 ${aqInfo.color}`} />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Air Quality</p>
          <p className={`text-xs ${aqInfo.color}`}>{aqInfo.label}</p>
        </div>

        {/* UV Index */}
        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
            <Sun className={`w-4 h-4 ${uvInfo.color}`} />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">UV Index</p>
          <p className={`text-xs ${uvInfo.color}`}>{uvInfo.label}</p>
        </div>

        {/* Sunrise */}
        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-2">
            <Sunrise className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Sunrise</p>
          <p className="text-xs text-gray-900 dark:text-white">{sunrise}</p>
        </div>

        {/* Sunset */}
        <div className="p-3 rounded-xl bg-gray-50/50 dark:bg-gray-700/50">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2">
            <Sunset className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">Sunset</p>
          <p className="text-xs text-gray-900 dark:text-white">{sunset}</p>
        </div>
      </div>
    </motion.div>
  );
}