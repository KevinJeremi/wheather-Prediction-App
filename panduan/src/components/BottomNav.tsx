import { Home, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeView: 'home' | 'history' | 'alerts' | 'settings';
  setActiveView: (view: 'home' | 'history' | 'alerts' | 'settings') => void;
}

export function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Home' },
    { id: 'history' as const, icon: TrendingUp, label: 'History' },
    { id: 'alerts' as const, icon: MessageSquare, label: 'AI Chat' },
    { id: 'settings' as const, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-4 mb-6 backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 dark:border-gray-700/50">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-[24px] transition-all min-w-[72px] ${isActive ? 'bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] shadow-lg' : ''
                  }`}
                whileTap={{ scale: 0.95 }}
                animate={isActive ? {
                  y: [0, -4, 0],
                } : {}}
                transition={{
                  y: {
                    duration: 0.3,
                    ease: "easeOut",
                  }
                }}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                />
                <span
                  className={`text-xs ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}