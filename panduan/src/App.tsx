import { useState, useEffect } from 'react';
import { ClimaSidebar } from './components/AnimatedSidebar';
import { HeroSection } from './components/HeroSection';
import { WeatherStatsCards } from './components/WeatherStatsCards';
import { PredictionChart } from './components/PredictionChart';
import { AIReasoning } from './components/AIReasoning';
import { BottomNav } from './components/BottomNav';
import { WeatherBackground } from './components/WeatherBackground';
import { TodaySummary } from './components/TodaySummary';
import { EnvironmentalInsights } from './components/EnvironmentalInsights';
import { RecentLocations } from './components/RecentLocations';
import { LocationCarousel } from './components/LocationCarousel';
import { SmartAlerts } from './components/SmartAlerts';
import { WeatherAnimations } from './components/WeatherAnimations';
import { LoadingCloud } from './components/LoadingCloud';
import { GlobeHint } from './components/GlobeHint';
import { motion } from 'motion/react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'history' | 'alerts' | 'settings'>('home');
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto Dark/Light mode based on time
  useEffect(() => {
    const hour = new Date().getHours();
    const shouldBeDark = hour < 6 || hour >= 20;
    setIsDark(shouldBeDark);
  }, []);

  // Track window size for responsive behavior
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Mock weather data
  const weatherData = {
    location: 'Tokyo, Japan',
    localTime: '14:00 JST',
    currentTemp: 26,
    feelsLike: 28,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'Southeast',
    rainProbability: 30,
    pressure: 1009,
    airQuality: 45,
    uvIndex: 6,
    sunrise: '5:32 AM',
    sunset: '6:45 PM',
    aiSummary: 'Pleasant weather today with partly cloudy skies. Temperature will rise slightly in the afternoon, reaching around 28°C by 3 PM.',
    maxTemp: 28,
    minTemp: 21,
    visibility: 10,
  };

  if (isLoading) {
    return (
      <div className={isDark ? 'dark' : ''}>
        <WeatherBackground condition={weatherData.condition} isDark={isDark} />
        <LoadingCloud />
      </div>
    );
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <WeatherBackground condition={weatherData.condition} isDark={isDark} />
      <WeatherAnimations condition={weatherData.condition} isDark={isDark} />

      <ClimaSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isDark={isDark}
        setIsDark={setIsDark}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* Main Content with dynamic margin for desktop sidebar */}
      <motion.main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-8 pb-32 md:pb-8"
        initial={false}
        animate={{
          marginLeft: isDesktop ? (sidebarOpen ? '280px' : '80px') : '0px',
        }}
        transition={{
          duration: 0.2,
          ease: 'linear',
        }}
      >
        {activeView === 'home' && (
          <div className="space-y-4">
            {/* Location Carousel */}
            <LocationCarousel />

            {/* Smart Alerts */}
            <SmartAlerts />

            <HeroSection
              temp={weatherData.currentTemp}
              location={weatherData.location}
              localTime={weatherData.localTime}
              condition={weatherData.condition}
              aiSummary={weatherData.aiSummary}
            />

            {/* Today's Summary */}
            <TodaySummary
              summary={weatherData.aiSummary}
              maxTemp={weatherData.maxTemp}
              minTemp={weatherData.minTemp}
              condition={weatherData.condition}
              humidity={weatherData.humidity}
              windSpeed={weatherData.windSpeed}
              visibility={weatherData.visibility}
              sunrise={weatherData.sunrise}
              sunset={weatherData.sunset}
            />

            {/* Compact Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left: Weather Stats - 2 columns */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <WeatherStatsCards
                  humidity={weatherData.humidity}
                  windSpeed={weatherData.windSpeed}
                  rainProbability={weatherData.rainProbability}
                  feelsLike={weatherData.feelsLike}
                />
              </div>

              {/* Right: Environmental Insights */}
              <EnvironmentalInsights
                airQuality={weatherData.airQuality}
                uvIndex={weatherData.uvIndex}
                sunrise={weatherData.sunrise}
                sunset={weatherData.sunset}
              />
            </div>

            {/* Chart and AI in one row for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PredictionChart />
              <AIReasoning pressure={weatherData.pressure} />
            </div>
          </div>
        )}

        {activeView === 'history' && (
          <div className="text-center py-20">
            <h2 className="text-gray-600 dark:text-gray-300">Weather History - Coming Soon</h2>
          </div>
        )}

        {activeView === 'alerts' && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl text-gray-900 dark:text-white mb-2">Weather Alerts</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Stay informed about weather changes
              </p>
            </motion.div>

            <SmartAlerts />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl text-center"
            >
              <div className="text-6xl mb-4">🌤️</div>
              <h3 className="text-lg text-gray-900 dark:text-white mb-2">
                No Active Warnings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The sky is looking beautiful today!
              </p>
            </motion.div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="text-center py-20">
            <h2 className="text-gray-600 dark:text-gray-300">Settings - Coming Soon</h2>
          </div>
        )}
      </motion.main>

      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      {/* Globe Hint - only show on first load */}
      {activeView === 'home' && <GlobeHint />}
    </div>
  );
}