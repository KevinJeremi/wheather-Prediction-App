import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  emoji: string;
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Temperature Drop Alert',
      message: 'Temperature expected to drop 5°C tonight. Consider bringing a jacket! 🧥',
      emoji: '🌡️',
    },
    {
      id: '2',
      type: 'info',
      title: 'UV Index High',
      message: 'UV index will reach 8 this afternoon. Don\'t forget sunscreen! ☀️',
      emoji: '☀️',
    },
  ]);

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'info':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'success':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
    }
  };

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ delay: index * 0.1 }}
            className={`
              bg-gradient-to-r ${getAlertStyles(alert.type)}
              backdrop-blur-xl rounded-2xl p-4 border
              shadow-lg relative overflow-hidden
            `}
          >
            {/* Animated background pulse */}
            <motion.div
              className="absolute inset-0 bg-white/5"
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            <div className="relative flex items-start gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {getIcon(alert.type)}
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm text-gray-900 dark:text-white">{alert.title}</h4>
                  <span>{alert.emoji}</span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {alert.message}
                </p>
              </div>
              
              <motion.button
                onClick={() => removeAlert(alert.id)}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
