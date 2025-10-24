import { MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface Location {
  city: string;
  country: string;
  temp: number;
  condition: string;
}

export function RecentLocations() {
  const locations: Location[] = [
    { city: 'Tokyo', country: 'Japan', temp: 26, condition: 'Partly Cloudy' },
    { city: 'Osaka', country: 'Japan', temp: 24, condition: 'Sunny' },
    { city: 'Kyoto', country: 'Japan', temp: 25, condition: 'Clear' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/30"
    >
      <h3 className="mb-4 text-gray-900 dark:text-white">Recent Locations</h3>
      
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {locations.map((location, index) => (
          <motion.button
            key={location.city}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="flex-shrink-0 w-40 p-4 rounded-2xl bg-gradient-to-br from-[#2F80ED]/10 to-[#56CCF2]/10 border border-white/30 hover:border-[#2F80ED]/30 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-[#2F80ED]" />
              <p className="text-sm text-gray-900 dark:text-white">{location.city}</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{location.country}</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl text-gray-900 dark:text-white">{location.temp}°</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{location.condition}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
