"use client";

import { motion } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({ isDark, setIsDark, sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-14 px-4 flex items-center justify-between bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 w-full fixed top-0 left-0 z-50 md:hidden"
    >
      {/* Logo */}
      <div className="flex items-center p-2">
        <img
          src="/logo.png"
          alt="Weather App"
          className="h-14 w-auto max-w-[160px] object-contain"
          loading="eager"
        />
      </div>

      {/* Right side - Theme Toggle and Menu */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle Button */}
        <motion.button
          onClick={() => setIsDark(!isDark)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </motion.button>

        {/* Menu Icon */}
        <motion.button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? (
            <X className="text-gray-800 dark:text-gray-200 w-6 h-6" />
          ) : (
            <Menu className="text-gray-800 dark:text-gray-200 w-6 h-6" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
