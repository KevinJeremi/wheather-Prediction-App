"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CloudRain, Wind, Sun, X } from 'lucide-react';
import { useState } from 'react';

export function SmartAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'rain',
      title: 'Light Rain Expected',
      message: 'Light precipitation expected in the next 2 hours',
      severity: 'moderate',
      dismissible: true
    },
    {
      id: 2,
      type: 'uv',
      title: 'High UV Index',
      message: 'UV levels will be high today. Remember to wear sunscreen',
      severity: 'high',
      dismissible: true
    }
  ]);

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-5 h-5" />;
      case 'wind': return <Wind className="w-5 h-5" />;
      case 'uv': return <Sun className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'from-red-500 to-orange-500';
      case 'moderate': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'moderate': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`relative rounded-2xl p-4 border ${getAlertBgColor(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAlertColor(alert.severity)} flex items-center justify-center text-white flex-shrink-0`}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {alert.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {alert.message}
                </p>
              </div>
              
              {alert.dismissible && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dismissAlert(alert.id)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
