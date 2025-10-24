import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { EnhancedGlobeBackground } from './EnhancedGlobeBackground';

interface WeatherBackgroundProps {
  condition: string;
  isDark: boolean;
}

export function WeatherBackground({ condition, isDark }: WeatherBackgroundProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  
  // Determine time of day
  const isNight = hour < 6 || hour >= 20;

  // Background base color based on mode
  const getBaseColor = () => {
    if (isDark) {
      return '#0a0e1a';
    }
    return '#f8fafc';
  };

  return (
    <>
      {/* Base solid background */}
      <div 
        className="fixed inset-0 -z-10 transition-colors duration-1000"
        style={{ backgroundColor: getBaseColor() }}
      />
      
      {/* Enhanced Globe Background */}
      <EnhancedGlobeBackground isDark={isDark} />

      {/* Stars for night time */}
      {(isNight || isDark) && (
        <div className="fixed inset-0 -z-10">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}