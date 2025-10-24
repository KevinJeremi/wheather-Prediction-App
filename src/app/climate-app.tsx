"use client";

import { useState, useEffect, useMemo } from 'react';
import { ClimaSidebar } from '@/components/layout/AnimatedSidebar';
import { HeroSection } from '@/components/weather/features/HeroSection';
import { WeatherStatsCards } from '@/components/weather/features/WeatherStatsCards';
import { PredictionChart } from '@/components/weather/features/PredictionChart';
import { AIReasoning } from '@/components/weather/features/AIReasoning';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { TodaySummary } from '@/components/weather/features/TodaySummary';
import { EnvironmentalInsights } from '@/components/weather/features/EnvironmentalInsights';
import { LocationCarousel } from '@/components/weather/features/LocationCarousel';
import { SmartAlerts } from '@/components/weather/features/SmartAlerts';
import Aurora from '@/components/weather/Aurora';
import { LoadingCloud } from '@/components/weather/animations/LoadingCloud';
import { GlobeHint } from '@/components/weather/animations/GlobeHint';
import { WeatherHistory } from '@/components/weather/features/WeatherHistory';
import { WeatherPrediction } from '@/components/weather/features/WeatherPrediction';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from '@/hooks/useWeather';
import { useGeolocation } from '@/hooks/useGeolocation';
import { WeatherProvider } from '@/context/WeatherContext';
import BoxLoader from '@/components/ui/box-loader';
import { MapPin, RefreshCw, Plus, Trash2, CloudRain, Sun, Wind, AlertCircle, AlertTriangle } from 'lucide-react';
import type { LocationCoordinates } from '@/types/weather.types';
import { useWeatherInsights } from '@/hooks/useWeatherInsights';

/**
 * Inner component yang menggunakan WeatherContext
 * Dipisah dari outer component yang menyediakan provider
 */
function ClimaSenseAppContent() {
    const [activeView, setActiveView] = useState<'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'>('home');
    const [isDark, setIsDark] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { location: currentLocation, isLoading: isGeoLoading, error: geoError, requestLocation: retryGeolocation } = useGeolocation();

    // Get saved locations from localStorage
    const [savedLocations, setSavedLocations] = useState<LocationCoordinates[]>([]);
    const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(-1);
    const [showLocationOptions, setShowLocationOptions] = useState(false);
    const [activeLocation, setActiveLocation] = useState<LocationCoordinates | null>(null);
    const [manualLocationInput, setManualLocationInput] = useState('');
    const [isSearchingLocation, setIsSearchingLocation] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('weatherLocations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const locations = parsed.map((loc: any) => ({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    name: loc.name
                }));
                setSavedLocations(locations);
            } catch (e) {
                setSavedLocations([]);
            }
        }
    }, []);

    // Update active location based on geolocation or user selection
    useEffect(() => {
        if (currentLocation) {
            setActiveLocation(currentLocation);
        } else if (selectedLocationIndex >= 0 && savedLocations[selectedLocationIndex]) {
            setActiveLocation(savedLocations[selectedLocationIndex]);
        }
    }, [currentLocation, selectedLocationIndex, savedLocations]);

    // Handle location selection from carousel
    const handleLocationSelect = (location: LocationCoordinates) => {
        setActiveLocation(location);
        setSelectedLocationIndex(-1);
    };

    // Search for location by name
    const searchLocationByName = async (locationName: string) => {
        if (!locationName.trim()) return;

        setIsSearchingLocation(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=5`,
                {
                    headers: {
                        'User-Agent': 'ClimaSenseWeatherApp/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to search location');
            }

            const results = await response.json();

            if (results.length > 0) {
                const firstResult = results[0];
                const newLocation: LocationCoordinates = {
                    latitude: parseFloat(firstResult.lat),
                    longitude: parseFloat(firstResult.lon),
                    name: firstResult.display_name || locationName
                };

                const saved = localStorage.getItem('weatherLocations');
                let locations = [];
                if (saved) {
                    try {
                        locations = JSON.parse(saved);
                    } catch (e) {
                        locations = [];
                    }
                }

                const exists = locations.some(
                    (loc: any) => loc.latitude === newLocation.latitude && loc.longitude === newLocation.longitude
                );

                if (!exists) {
                    locations.push(newLocation);
                    localStorage.setItem('weatherLocations', JSON.stringify(locations));
                    setSavedLocations(locations);
                }

                setActiveLocation(newLocation);
                setShowLocationOptions(false);
                setManualLocationInput('');
            } else {
                alert('Lokasi tidak ditemukan. Coba dengan nama kota yang berbeda.');
            }
        } catch (error) {
            console.error('Failed to search location:', error);
            alert('Gagal mencari lokasi. Silakan coba lagi.');
        } finally {
            setIsSearchingLocation(false);
        }
    };

    const { data: weatherData, isLoading: isWeatherLoading, error: weatherError } = useWeather(activeLocation, {
        refetchInterval: 600000,
        includeHourly: true,
        hourlyCount: 24,
        enabled: activeLocation !== null
    });

    const { summary: aiSummary, alerts: aiAlerts } = useWeatherInsights(
        weatherData || null,
        activeLocation?.name || null
    );

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

    // Apply dark mode class to document
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Get current weather condition based on weatherCode
    const getWeatherConditionText = (weatherCode: number): string => {
        if (weatherCode <= 3) return 'Clear';
        if (weatherCode <= 48) return 'Cloudy';
        if (weatherCode <= 55) return 'Drizzle';
        if (weatherCode <= 65) return 'Rainy';
        if (weatherCode <= 77) return 'Snowy';
        if (weatherCode <= 82) return 'Showers';
        if (weatherCode <= 99) return 'Thunderstorm';
        return 'Unknown';
    };

    // Format time to HH:MM with timezone
    const formatLocalTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // Get Aurora colors based on dark mode
    const getAuroraColors = (): string[] => {
        if (isDark) {
            return ['#0F2638', '#102123', '#12161C'];
        }
        return ['#2F80ED', '#FFFFFF', '#56CCF2'];
    };

    // Generate AI summary
    const generateAISummary = (): string => {
        if (!weatherData) return 'Loading weather data...';

        const current = weatherData.hourly[0];
        const today = weatherData.daily[0];
        const condition = getWeatherConditionText(current.weatherCode);

        return `Currently ${condition.toLowerCase()} with temperature at ${current.temperature.toFixed(1)}°C. ` +
            `Today's high will be ${today.temperatureMax}°C with ${today.precipitationSum.toFixed(1)}mm expected rain. ` +
            `Humidity is at ${current.humidity}% and wind speed is ${current.windSpeed.toFixed(1)} km/h.`;
    };

    // Calculate AI Context for better analysis
    const aiContext = useMemo(() => {
        if (!weatherData) return null;

        const current = weatherData.hourly[0];
        const today = weatherData.daily[0];

        // Determine temperature status
        let temperatureStatus: 'hot' | 'warm' | 'cool' | 'cold' = 'warm';
        if (current.temperature >= 30) temperatureStatus = 'hot';
        else if (current.temperature >= 20) temperatureStatus = 'warm';
        else if (current.temperature >= 10) temperatureStatus = 'cool';
        else temperatureStatus = 'cold';

        // Determine precipitation trend
        let precipitationTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
        const todayPrecip = today.precipitationSum;
        const tomorrowPrecip = weatherData.daily[1]?.precipitationSum || 0;
        if (tomorrowPrecip > todayPrecip * 1.2) precipitationTrend = 'increasing';
        else if (tomorrowPrecip < todayPrecip * 0.8) precipitationTrend = 'decreasing';

        return {
            currentCondition: getWeatherConditionText(current.weatherCode),
            temperatureStatus,
            precipitationTrend,
            lastUpdateTime: new Date().toISOString(),
        };
    }, [weatherData]);

    // Build context value for provider
    const contextValue = useMemo(() => ({
        activeLocation,
        weatherData,
        isLoading,
        isWeatherLoading,
        isGeoLoading,
        weatherError,
        geoError,
        savedLocations,
        isDark,
        aiContext,
    }), [activeLocation, weatherData, isLoading, isWeatherLoading, isGeoLoading, weatherError, geoError, savedLocations, isDark, aiContext]);

    if (isLoading) {
        return (
            <div className={isDark ? 'dark' : ''}>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />
                <div className="flex items-center justify-center min-h-screen">
                    <BoxLoader />
                </div>
            </div>
        );
    }

    if (!activeLocation && geoError) {
        return (
            <div className={isDark ? 'dark' : ''}>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50 dark:border-gray-700/50"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0-6a4 4 0 110-8 4 4 0 010 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Akses Lokasi Diperlukan
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {geoError}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={retryGeolocation}
                                disabled={isGeoLoading}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isGeoLoading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Mendeteksi Lokasi...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Coba Lagi
                                    </>
                                )}
                            </motion.button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                        atau
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowLocationOptions(true)}
                                className="w-full p-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                Pilih Lokasi Manual
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (showLocationOptions) {
        return (
            <div className={isDark ? 'dark' : ''}>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/50 dark:border-gray-700/50 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Pilih Lokasi
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Cari atau pilih dari lokasi tersimpan
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="mb-6 space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualLocationInput}
                                    onChange={(e) => setManualLocationInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !isSearchingLocation) {
                                            searchLocationByName(manualLocationInput);
                                        }
                                    }}
                                    placeholder="Cari nama kota..."
                                    className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => searchLocationByName(manualLocationInput)}
                                    disabled={isSearchingLocation || !manualLocationInput.trim()}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 min-w-[100px]"
                                >
                                    {isSearchingLocation ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                        />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                </motion.button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Contoh: Jakarta, Bandung, Surabaya</p>
                        </div>

                        {/* Saved Locations */}
                        {savedLocations.length > 0 && (
                            <div className="space-y-2 mb-6">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                    Lokasi Tersimpan
                                </p>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {savedLocations.map((loc, index) => (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-[#2F80ED]/10 to-[#56CCF2]/10 border border-[#2F80ED]/20 hover:border-[#2F80ED]/40 cursor-pointer group transition-all"
                                            onClick={() => {
                                                setActiveLocation(loc);
                                                setShowLocationOptions(false);
                                            }}
                                        >
                                            <MapPin className="w-4 h-4 text-[#2F80ED] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {loc.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                                                </p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const updated = savedLocations.filter((_, i) => i !== index);
                                                    setSavedLocations(updated);
                                                    localStorage.setItem('weatherLocations', JSON.stringify(updated));
                                                }}
                                                className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowLocationOptions(false)}
                                className="w-full p-3 rounded-xl bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white font-medium hover:shadow-lg transition-shadow"
                            >
                                Kembali
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isGeoLoading && !activeLocation) {
        return (
            <div className={isDark ? 'dark' : ''}>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />
                <div className="flex items-center justify-center min-h-screen">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="w-16 h-16 border-4 border-gray-300 border-t-[#2F80ED] rounded-full mx-auto mb-4"
                        />
                        <p className="text-white text-lg font-medium">Mendeteksi lokasi Anda...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    if (isWeatherLoading && !weatherData) {
        return (
            <div className={isDark ? 'dark' : ''}>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />
                <div className="flex items-center justify-center min-h-screen">
                    <BoxLoader />
                </div>
            </div>
        );
    }

    // Main content with Weather Context Provider
    return (
        <WeatherProvider value={contextValue}>
            <div className={isDark ? 'dark' : ''} suppressHydrationWarning>
                <Aurora
                    colorStops={getAuroraColors()}
                    blend={0.6}
                    amplitude={1.2}
                    speed={0.8}
                />

                {/* Desktop Sidebar */}
                <ClimaSidebar
                    activeView={activeView as 'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'}
                    setActiveView={setActiveView as any}
                    isDark={isDark}
                    setIsDark={setIsDark}
                    open={sidebarExpanded}
                    setOpen={setSidebarExpanded}
                />

                {/* Mobile Header */}
                {!isDesktop && (
                    <Header
                        isDark={isDark}
                        setIsDark={setIsDark}
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                )}

                {/* Mobile Sidebar Drawer */}
                <AnimatePresence>
                    {!isDesktop && sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-40"
                                onClick={() => setSidebarOpen(false)}
                            />
                            <motion.div
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                className="fixed left-0 top-0 h-full w-72 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl z-50 p-6"
                            >
                                <div className="flex items-center justify-center mb-8 p-4">
                                    <img
                                        src="/logo.png"
                                        alt="Weather App"
                                        className="h-16 w-auto max-w-[180px] object-contain"
                                        loading="eager"
                                    />
                                </div>

                                <nav className="space-y-2">
                                    {[
                                        { label: 'Home', value: 'home' as const, icon: '🏠' },
                                        { label: 'History', value: 'history' as const, icon: '📈' },
                                        { label: 'Alerts', value: 'alerts' as const, icon: '🔔' },
                                        { label: 'Settings', value: 'settings' as const, icon: '⚙️' },
                                    ].map((item) => (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                setActiveView(item.value);
                                                setSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === item.value
                                                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            <span className="text-lg">{item.icon}</span>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main
                    className={`max-w-full mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-200 ${isDesktop ? 'pt-8 pb-8' : 'pt-20 pb-32'
                        }`}
                    style={{
                        marginLeft: isDesktop ? (sidebarExpanded ? '300px' : '80px') : '0px',
                    }}
                >
                    <AnimatePresence mode="wait">
                        {activeView === 'home' && (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Location Carousel */}
                                <LocationCarousel onLocationSelect={handleLocationSelect} />

                                {/* Smart Alerts */}
                                <SmartAlerts weatherData={weatherData} />

                                {/* Hero Section */}
                                {weatherData && (
                                    <HeroSection
                                        temp={Math.round(weatherData.hourly[0].temperature)}
                                        location={weatherData.location.name}
                                        localTime={formatLocalTime(new Date())}
                                        condition={getWeatherConditionText(weatherData.hourly[0].weatherCode)}
                                        aiSummary={aiSummary || generateAISummary()}
                                    />
                                )}

                                {/* Today's Summary */}
                                {weatherData && (
                                    <TodaySummary
                                        summary={generateAISummary()}
                                        maxTemp={weatherData.daily[0].temperatureMax}
                                        minTemp={weatherData.daily[0].temperatureMin}
                                        condition={getWeatherConditionText(weatherData.hourly[0].weatherCode)}
                                        humidity={weatherData.hourly[0].humidity}
                                        windSpeed={weatherData.hourly[0].windSpeed}
                                        visibility={weatherData.visibility?.valueKm || 10}
                                        sunrise={new Date(weatherData.daily[0].sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        sunset={new Date(weatherData.daily[0].sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    />
                                )}

                                {/* Compact Grid Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    {/* Left: Weather Stats - 2 columns */}
                                    <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                        {weatherData && (
                                            <WeatherStatsCards
                                                humidity={weatherData.hourly[0].humidity}
                                                windSpeed={weatherData.hourly[0].windSpeed}
                                                rainProbability={Math.round((weatherData.daily[0].precipitationSum / 50) * 100)}
                                                feelsLike={Math.round(weatherData.hourly[0].temperature)}
                                            />
                                        )}
                                    </div>

                                    {/* Right: Environmental Insights */}
                                    {weatherData && (
                                        <EnvironmentalInsights
                                            airQuality={weatherData.airQuality ? {
                                                aqi: weatherData.airQuality.aqi,
                                                aqiLevel: weatherData.airQuality.aqiLevel,
                                                pm25: weatherData.airQuality.pm25
                                            } : undefined}
                                            visibility={weatherData.visibility ? {
                                                valueKm: weatherData.visibility.valueKm
                                            } : undefined}
                                            uvIndex={weatherData.daily[0].uvIndexMax}
                                            sunrise={new Date(weatherData.daily[0].sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            sunset={new Date(weatherData.daily[0].sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        />
                                    )}
                                </div>

                                {/* Chart and AI in one row for desktop */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <PredictionChart weatherData={weatherData} />
                                    {weatherData && (
                                        <AIReasoning pressure={weatherData.hourly[0].pressure} />
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeView === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center py-20"
                            >
                                <h2 className="text-2xl text-gray-600 dark:text-gray-300">Select a view below</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Choose Weather History or Forecast from the sidebar</p>
                            </motion.div>
                        )}

                        {activeView === 'weather-history' && (
                            <motion.div
                                key="weather-history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <WeatherHistory currentWeatherData={weatherData || undefined} />
                            </motion.div>
                        )}

                        {activeView === 'weather-prediction' && (
                            <motion.div
                                key="weather-prediction"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <WeatherPrediction currentWeatherData={weatherData || undefined} />
                            </motion.div>
                        )}

                        {activeView === 'alerts' && (
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-4"
                            >
                                <div className="mb-8">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Weather Alerts</h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Stay informed about weather changes
                                    </p>
                                </div>

                                {/* Show loading state */}
                                {!weatherData && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="w-12 h-12 border-4 border-gray-300 border-t-[#2F80ED] rounded-full mx-auto mb-4"
                                        />
                                        <p className="text-gray-600 dark:text-gray-400">Loading weather alerts...</p>
                                    </motion.div>
                                )}

                                {/* Display AI-generated alerts (max 5) */}
                                {weatherData && aiAlerts && aiAlerts.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1 h-6 bg-gradient-to-b from-[#2F80ED] to-[#56CCF2] rounded-full"></div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Active Alerts ({aiAlerts.slice(0, 5).length})
                                            </h2>
                                        </div>

                                        <AnimatePresence>
                                            {aiAlerts.slice(0, 5).map((alert, index) => (
                                                <motion.div
                                                    key={alert.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`relative rounded-2xl p-5 border ${alert.severity === 'high'
                                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                        : alert.severity === 'moderate'
                                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                                            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${alert.severity === 'high'
                                                            ? 'bg-gradient-to-br from-red-500 to-orange-500'
                                                            : alert.severity === 'moderate'
                                                                ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                                                            }`}>
                                                            {alert.type === 'rain' && <CloudRain className="w-5 h-5" />}
                                                            {alert.type === 'uv' && <Sun className="w-5 h-5" />}
                                                            {alert.type === 'wind' && <Wind className="w-5 h-5" />}
                                                            {alert.type === 'temp' && <AlertCircle className="w-5 h-5" />}
                                                            {alert.type === 'humidity' && <AlertCircle className="w-5 h-5" />}
                                                            {alert.type === 'general' && <AlertTriangle className="w-5 h-5" />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                    {alert.title}
                                                                </h4>
                                                                {alert.aiGenerated && (
                                                                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                                                                        AI
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                                {alert.message}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${alert.severity === 'high'
                                                                    ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                                    : alert.severity === 'moderate'
                                                                        ? 'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                                        : 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                    }`}>
                                                                    {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                ) : weatherData ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl text-center"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            No Active Warnings
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            All weather conditions are normal
                                        </p>
                                    </motion.div>
                                ) : null}
                            </motion.div>
                        )}

                        {activeView === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center py-20"
                            >
                                <h2 className="text-2xl text-gray-600 dark:text-gray-300">Settings - Coming Soon</h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Customize your weather experience</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Bottom Navigation for Mobile */}
                <BottomNav
                    activeView={activeView as 'home' | 'history' | 'weather-history' | 'weather-prediction' | 'alerts' | 'settings'}
                    setActiveView={setActiveView as any}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {/* Globe Hint - only show on first load */}
                <GlobeHint />
            </div>
        </WeatherProvider>
    );
}

/**
 * Main export dengan provider wrapper
 */
export default function ClimaSenseApp() {
    return <ClimaSenseAppContent />;
}

