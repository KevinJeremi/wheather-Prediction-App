import { motion } from 'motion/react';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

interface Location {
  id: string;
  name: string;
  country: string;
  temp: number;
  condition: string;
  emoji: string;
}

export function LocationCarousel() {
  const [selectedLocation, setSelectedLocation] = useState(0);
  
  const locations: Location[] = [
    { id: '1', name: 'Tokyo', country: 'Japan', temp: 26, condition: 'Partly Cloudy', emoji: '🌆' },
    { id: '2', name: 'Osaka', country: 'Japan', temp: 24, condition: 'Rainy', emoji: '🌧️' },
    { id: '3', name: 'Kyoto', country: 'Japan', temp: 23, condition: 'Cloudy', emoji: '☁️' },
    { id: '4', name: 'Sapporo', country: 'Japan', temp: 18, condition: 'Clear', emoji: '☀️' },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {locations.map((location, index) => (
          <motion.button
            key={location.id}
            onClick={() => setSelectedLocation(index)}
            className={`
              flex-shrink-0 px-4 py-3 rounded-2xl backdrop-blur-xl border transition-all
              ${selectedLocation === index 
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] border-white/30 text-white shadow-lg scale-105' 
                : 'bg-white/40 dark:bg-gray-800/40 border-white/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
              }
            `}
            whileHover={{ scale: selectedLocation === index ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{location.emoji}</span>
              <div className="text-left">
                <div className="text-sm whitespace-nowrap">{location.name}</div>
                <div className={`text-xs ${selectedLocation === index ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {location.temp}°C
                </div>
              </div>
            </div>
          </motion.button>
        ))}
        
        {/* Add Location Button */}
        <motion.button
          className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
