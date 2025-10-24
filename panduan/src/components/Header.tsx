import { Home, TrendingUp, Bell, Settings, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  activeView: 'home' | 'history' | 'alerts' | 'settings';
  setActiveView: (view: 'home' | 'history' | 'alerts' | 'settings') => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

export function Header({ activeView, setActiveView, isDark, setIsDark }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border-b border-white/20 dark:border-gray-700/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Title */}
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-lg">☀️</span>
            </motion.div>
            <div>
              <h1 className="text-[#2F80ED] dark:text-[#56CCF2] text-sm">ClimaSense AI</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5">Intelligent Weather</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all ${activeView === 'home'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all ${activeView === 'history'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveView('alerts')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all ${activeView === 'alerts'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </button>

            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-xl transition-all ${activeView === 'settings'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={() => setIsDark(!isDark)}
              className="ml-1 p-2 rounded-xl bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </motion.button>
          </nav>

          {/* Mobile Dark Mode Toggle */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className="md:hidden p-2 rounded-xl bg-white/50 dark:bg-gray-700/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}