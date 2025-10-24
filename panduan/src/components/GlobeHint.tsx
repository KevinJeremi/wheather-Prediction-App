import { motion, AnimatePresence } from 'motion/react';
import { MousePointerClick } from 'lucide-react';
import { useState, useEffect } from 'react';

export function GlobeHint() {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    // Hide hint after 5 seconds
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 1 }}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 pointer-events-none"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/20 dark:border-gray-700/20 shadow-xl">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <MousePointerClick className="w-5 h-5 text-[#2F80ED]" />
              </motion.div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Drag to rotate the globe 🌍
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
