"use client";

import { useState, useEffect } from "react";
import { Menu, X, Home, TrendingUp, Bell, Settings, Moon, Sun, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClimaSidebarProps {
  activeView: 'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings';
  setActiveView: React.Dispatch<React.SetStateAction<'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'>>;
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ClimaSidebar({
  activeView,
  setActiveView,
  isDark,
  setIsDark,
  open,
  setOpen,
}: ClimaSidebarProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const navigationLinks = [
    {
      label: 'Home',
      value: 'home' as const,
      icon: <Home size={20} />,
      submenu: null
    },
    {
      label: 'History',
      value: 'history' as const,
      icon: <TrendingUp size={20} />,
      submenu: [
        { label: 'Weather History', value: 'weather-history' as const },
        { label: 'Forecast', value: 'weather-prediction' as const }
      ]
    },
    {
      label: 'Alerts',
      value: 'alerts' as const,
      icon: <Bell size={20} />,
      submenu: null
    },
    {
      label: 'Settings',
      value: 'settings' as const,
      icon: <Settings size={20} />,
      submenu: null
    },
  ];

  if (isDesktop) {
    return (
      <motion.div
        className="h-screen px-4 py-6 hidden md:flex md:flex-col bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 fixed left-0 top-0 z-40"
        animate={{
          width: open ? "300px" : "80px",
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            <motion.img
              key={open ? "full" : "compact"}
              src={open ? "/logo.png" : "/just_logo.png"}
              alt={open ? "Weather App" : "Weather App Logo"}
              className={open ? "h-20 w-auto max-w-[240px] object-contain" : "h-10 w-auto max-w-[42px] object-contain"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              loading="eager"
            />
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationLinks.map((link) => (
            <div key={link.value}>
              <motion.button
                onClick={() => {
                  if (link.submenu) {
                    setHistoryExpanded(!historyExpanded);
                  } else {
                    setActiveView(link.value);
                    setHistoryExpanded(false);
                  }
                }}
                className={cn(
                  "flex items-center justify-start gap-3 py-3 px-3 rounded-xl transition-all w-full",
                  (activeView === link.value ||
                    (link.submenu && ['weather-history', 'weather-prediction'].includes(activeView)))
                    ? "bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
                )}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0">
                  {link.icon}
                </div>
                <AnimatePresence>
                  {open && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between flex-1"
                    >
                      <span className="text-sm font-medium">
                        {link.label}
                      </span>
                      {link.submenu && (
                        <motion.div
                          animate={{ rotate: historyExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={16} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Submenu */}
              <AnimatePresence>
                {open && link.submenu && historyExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 mt-1 ml-2">
                      {link.submenu.map((subitem) => (
                        <motion.button
                          key={subitem.value}
                          onClick={() => {
                            setActiveView(subitem.value);
                            setHistoryExpanded(false);
                          }}
                          className={cn(
                            "flex items-center justify-start gap-3 py-2 px-3 rounded-lg transition-all w-full text-sm",
                            activeView === subitem.value
                              ? "bg-white/30 text-white shadow-md"
                              : "text-gray-500 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-gray-700/30"
                          )}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          <span className="font-medium">
                            {subitem.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Theme Toggle */}
        <motion.div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className={cn(
              "flex items-center justify-start gap-3 py-3 px-3 rounded-xl transition-all w-full",
              "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
            )}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex-shrink-0">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Mobile sidebar handled through header component
  return null;
}
