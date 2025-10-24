"use client";

import { Home, TrendingUp, Bell, Menu, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeView: 'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings';
  setActiveView: React.Dispatch<React.SetStateAction<'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'>>;
  onMenuClick?: () => void;
}

export function BottomNav({ activeView, setActiveView, onMenuClick }: BottomNavProps) {
  const navigationLinks = [
    {
      label: 'Home',
      value: 'home' as const,
      icon: <Home size={20} />
    },
    {
      label: 'History',
      value: 'history' as const,
      icon: <TrendingUp size={20} />
    },
    {
      label: 'Alerts',
      value: 'alerts' as const,
      icon: <Bell size={20} />
    },
    {
      label: 'Menu',
      value: 'settings' as const,
      icon: onMenuClick ? <Menu size={20} /> : <Settings size={20} />
    }
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20">
        <div className="grid grid-cols-4 gap-1 py-2">
          {navigationLinks.map((link) => (
            <motion.button
              key={link.value}
              onClick={() => link.value === 'settings' && onMenuClick ? onMenuClick() : setActiveView(link.value)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 mx-1 rounded-xl transition-all",
                activeView === link.value
                  ? "bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white"
                  : "text-gray-600 dark:text-gray-300"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="mb-1">
                {link.icon}
              </div>
              <span className="text-xs font-medium">
                {link.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
