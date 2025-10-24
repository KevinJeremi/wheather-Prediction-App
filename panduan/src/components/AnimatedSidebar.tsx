"use client";

import { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Home, TrendingUp, Bell, Settings, Moon, Sun } from "lucide-react";
import { cn } from "./ui/utils";

interface Links {
  label: string;
  value: 'home' | 'history' | 'alerts' | 'settings';
  icon: React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const AnimatedSidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "h-screen px-4 py-6 hidden md:flex md:flex-col bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 w-[280px] flex-shrink-0 fixed left-0 top-0 z-40",
        className
      )}
      animate={{
        width: animate ? (open ? "280px" : "80px") : "280px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 flex flex-row md:hidden items-center justify-between bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 w-full fixed top-0 left-0 z-50"
        )}
        {...props}
      >
        {/* Logo */}
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

        <div className="flex justify-end z-20">
          <Menu
            className="text-gray-800 dark:text-gray-200 cursor-pointer w-6 h-6"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-gray-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-gray-800 dark:text-gray-200 cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const { open, animate } = useSidebar();
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-xl transition-all w-full",
        isActive 
          ? "bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg"
          : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0">
        {link.icon}
      </div>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </button>
  );
};

export const Logo = ({ open }: { open: boolean }) => {
  return (
    <div className="flex items-center gap-2.5 px-2 mb-8">
      <motion.div 
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] flex items-center justify-center shadow-lg flex-shrink-0"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <span className="text-xl">☀️</span>
      </motion.div>
      <motion.div
        animate={{
          display: open ? "block" : "none",
          opacity: open ? 1 : 0,
        }}
      >
        <h1 className="text-[#2F80ED] dark:text-[#56CCF2]">ClimaSense AI</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Intelligent Weather</p>
      </motion.div>
    </div>
  );
};

export function ClimaSidebar({
  activeView,
  setActiveView,
  isDark,
  setIsDark,
  open,
  setOpen,
}: {
  activeView: 'home' | 'history' | 'alerts' | 'settings';
  setActiveView: (view: 'home' | 'history' | 'alerts' | 'settings') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const links: Links[] = [
    {
      label: "Home",
      value: "home",
      icon: <Home className="w-5 h-5 flex-shrink-0" />,
    },
    {
      label: "History",
      value: "history",
      icon: <TrendingUp className="w-5 h-5 flex-shrink-0" />,
    },
    {
      label: "Alerts",
      value: "alerts",
      icon: <Bell className="w-5 h-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      value: "settings",
      icon: <Settings className="w-5 h-5 flex-shrink-0" />,
    },
  ];
  
  return (
    <AnimatedSidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Logo open={open} />
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <SidebarLink 
                key={link.value} 
                link={link}
                isActive={activeView === link.value}
                onClick={() => setActiveView(link.value)}
              />
            ))}
          </div>
        </div>
        
        <div>
          {/* Dark Mode Toggle */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className={cn(
              "flex items-center justify-start gap-3 py-3 px-3 rounded-xl transition-all w-full",
              "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50"
            )}
          >
            <div className="flex-shrink-0">
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </div>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-sm whitespace-pre"
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </motion.span>
          </motion.button>
        </div>
      </SidebarBody>
    </AnimatedSidebar>
  );
}