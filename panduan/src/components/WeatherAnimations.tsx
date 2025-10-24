import { motion } from 'motion/react';

interface WeatherAnimationsProps {
  condition: string;
  isDark: boolean;
}

export function WeatherAnimations({ condition, isDark }: WeatherAnimationsProps) {
  const conditionLower = condition.toLowerCase();

  // Rain Animation
  if (conditionLower.includes('rain') || conditionLower.includes('shower')) {
    return (
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-8 bg-gradient-to-b from-blue-400/60 to-transparent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  // Snow Animation
  if (conditionLower.includes('snow')) {
    return (
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
            }}
            animate={{
              y: ['0vh', '105vh'],
              x: [0, Math.random() * 50 - 25],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  }

  // Cloud Animation for Cloudy
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return (
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 40 + 10}%`,
              left: `-10%`,
            }}
            animate={{
              x: ['0vw', '110vw'],
            }}
            transition={{
              duration: 40 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: 'linear',
            }}
          >
            <div className="relative">
              <div className="w-32 h-16 bg-white/20 dark:bg-gray-600/20 rounded-full blur-xl" />
              <div className="absolute top-2 left-8 w-24 h-12 bg-white/15 dark:bg-gray-600/15 rounded-full blur-lg" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  // Thunderstorm Animation
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return (
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {/* Rain */}
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-0.5 h-10 bg-gradient-to-b from-blue-300/70 to-transparent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{
              y: ['0vh', '110vh'],
            }}
            transition={{
              duration: 0.8 + Math.random() * 0.3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
        
        {/* Lightning Flash */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`lightning-${i}`}
            className="absolute inset-0 bg-white/0"
            animate={{
              opacity: [0, 0, 0, 0.3, 0, 0.4, 0, 0, 0, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 3,
            }}
          />
        ))}
      </div>
    );
  }

  // Sunny - particles
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return (
      <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300/40 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
