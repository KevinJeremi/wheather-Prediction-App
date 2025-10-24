"use client";

import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

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

      <Menu
        className="text-gray-800 dark:text-gray-200 cursor-pointer w-6 h-6"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      />
    </motion.div>
  );
}
