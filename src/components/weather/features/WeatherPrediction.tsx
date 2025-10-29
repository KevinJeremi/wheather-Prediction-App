'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Droplets, Wind, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';
import type { CombinedWeatherData } from '@/types/weather.types';

interface WeatherPredictionProps {
    currentWeatherData?: CombinedWeatherData;
}

interface PredictionDataPoint {
    date: string;
    day: string;
    temperature: number;
    tempHigh: number;
    tempLow: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    confidence: number;
    condition: string;
    uvIndex: number;
}

export function WeatherPrediction({ currentWeatherData }: WeatherPredictionProps) {
    const [predictionDays, setPredictionDays] = useState<'5days' | '10days' | '15days'>('5days');
    const [predictionData, setPredictionData] = useState<PredictionDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'precipitation' | 'wind' | 'combined'>('temperature');
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Process real forecast data from JMA model API
    useEffect(() => {
        const processForecastData = () => {
            if (!currentWeatherData || !currentWeatherData.daily) {
                setIsLoading(false);
                return;
            }

            const data: PredictionDataPoint[] = [];
            const daysToShow = predictionDays === '5days' ? 5 : predictionDays === '10days' ? 10 : 15;

            // Map weather code to emoji condition
            const getConditionEmoji = (code: number): string => {
                if (code <= 3) return '☀️ Sunny';
                if (code <= 48) return '☁️ Cloudy';
                if (code <= 55) return '🌧️ Drizzle';
                if (code <= 65) return '🌧️ Rainy';
                if (code <= 77) return '❄️ Snowy';
                if (code <= 82) return '🌦️ Showers';
                if (code <= 99) return '⛈️ Stormy';
                return '⛅ Partly Cloudy';
            };

            // Use available forecast days (up to 16 from JMA, starting from day 1)
            const availableDays = Math.min(daysToShow, currentWeatherData.daily.length - 1);

            // Debug: Check if windSpeedMax exists in first day
            if (currentWeatherData.daily.length > 1) {
                const firstDay = currentWeatherData.daily[1];
                console.log('🌬️ WeatherPrediction Debug - First day data:', {
                    date: firstDay.date,
                    hasWindSpeedMax: 'windSpeedMax' in firstDay,
                    windSpeedMax: firstDay.windSpeedMax,
                    allFields: Object.keys(firstDay)
                });
            }

            for (let i = 1; i <= availableDays; i++) {
                const dayData = currentWeatherData.daily[i];
                const date = new Date(dayData.date);
                
                const tempHigh = dayData.temperatureMax;
                const tempLow = dayData.temperatureMin;
                const temp = (tempHigh + tempLow) / 2;

                // Calculate confidence based on forecast day (decreases over time)
                const confidence = Math.max(60, 95 - (i * 2.5));

                // Safely get wind speed with fallback
                const windSpeedValue = dayData.windSpeedMax ?? 0;

                data.push({
                    date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    temperature: Math.round(temp * 10) / 10,
                    tempHigh: Math.round(tempHigh * 10) / 10,
                    tempLow: Math.round(tempLow * 10) / 10,
                    humidity: Math.round(currentWeatherData.hourly[i * 24]?.humidity || 70),
                    precipitation: Math.round(dayData.precipitationSum * 10) / 10,
                    windSpeed: Math.round(windSpeedValue * 10) / 10,
                    confidence: Math.round(confidence),
                    condition: getConditionEmoji(dayData.weatherCode),
                    uvIndex: Math.round(dayData.uvIndexMax * 10) / 10,
                });
            }

            setPredictionData(data);
            setIsLoading(false);
        };

        setIsLoading(true);
        processForecastData();
    }, [predictionDays, currentWeatherData]);

    // Detect dark mode
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    // Calculate prediction stats
    const stats = predictionData.length > 0 ? {
        avgTemp: Math.round(predictionData.reduce((sum, d) => sum + d.temperature, 0) / predictionData.length * 10) / 10,
        maxTemp: Math.max(...predictionData.map(d => d.tempHigh)),
        minTemp: Math.min(...predictionData.map(d => d.tempLow)),
        expectedRain: Math.round(predictionData.reduce((sum, d) => sum + d.precipitation, 0) * 10) / 10,
        avgConfidence: Math.round(predictionData.reduce((sum, d) => sum + d.confidence, 0) / predictionData.length),
    } : { avgTemp: 0, maxTemp: 0, minTemp: 0, expectedRain: 0, avgConfidence: 0 };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Weather Forecast</h1>
                    <p className="text-gray-600 dark:text-gray-400">Advanced weather predictions for your location</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl">
                    <TrendingUp size={18} />
                    <span className="text-sm font-semibold">{stats.avgConfidence}% Confidence</span>
                </div>
            </motion.div>

            {/* Forecast Range Selector */}
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
                {(['5days', '10days', '15days'] as const).map((range) => (
                    <button
                        key={range}
                        onClick={() => setPredictionDays(range)}
                        className={`px-4 py-2 rounded-xl transition-all ${predictionDays === range
                            ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        {range === '5days' ? 'Next 5 Days' : range === '10days' ? 'Next 10 Days' : 'Next 15 Days'}
                    </button>
                ))}
            </motion.div>

            {/* Prediction Summary Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Avg Temp', value: `${stats.avgTemp}°C`, icon: '🌡️', color: 'from-orange-400 to-red-500' },
                    { label: 'Max Temp', value: `${stats.maxTemp}°C`, icon: '📈', color: 'from-red-400 to-pink-500' },
                    { label: 'Min Temp', value: `${stats.minTemp}°C`, icon: '❄️', color: 'from-blue-400 to-cyan-500' },
                    { label: 'Expected Rain', value: `${stats.expectedRain}mm`, icon: '🌧️', color: 'from-cyan-400 to-blue-500' },
                    { label: 'Confidence', value: `${stats.avgConfidence}%`, icon: '🎯', color: 'from-green-400 to-emerald-500' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}
                    >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <p className="text-xs opacity-90">{stat.label}</p>
                        <p className="text-lg font-bold">{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Metric Selector */}
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
                {(['temperature', 'precipitation', 'wind', 'combined'] as const).map((metric) => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-4 py-2 rounded-xl transition-all capitalize flex items-center gap-2 ${selectedMetric === metric
                            ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        {metric === 'temperature' && <>🌡️ Temperature</>}
                        {metric === 'precipitation' && <>💧 Precipitation</>}
                        {metric === 'wind' && <>💨 Wind</>}
                        {metric === 'combined' && <><BarChart3 size={18} className="inline mr-2" />Combined</>}
                    </button>
                ))}
            </motion.div>

            {/* Main Chart */}
            <motion.div
                variants={itemVariants}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedMetric === 'temperature' && '🌡️ Temperature Forecast (Future)'}
                        {selectedMetric === 'precipitation' && '💧 Precipitation Forecast (Future)'}
                        {selectedMetric === 'wind' && '💨 Wind Speed Forecast (Future)'}
                        {selectedMetric === 'combined' && <><BarChart3 size={20} className="inline mr-2" />Combined Forecast (Future)</>}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span>← Today</span>
                        <span className="inline-block w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></span>
                        <span>Future →</span>
                    </span>
                </div>

                {isLoading ? (
                    <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Generating forecast...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        {selectedMetric === 'temperature' ? (
                            <ComposedChart data={predictionData}>
                                <defs>
                                    <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                <XAxis dataKey="date" stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <YAxis stroke={isDarkMode ? "#d1d5db" : "#666"} yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="tempHigh" stroke="#FF6B6B" fill="url(#forecastGradient)" />
                                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#2F80ED" strokeWidth={2} dot={{ fill: '#2F80ED' }} />
                                <Line yAxisId="left" type="monotone" dataKey="tempLow" stroke="#4ECDC4" strokeWidth={2} dot={{ fill: '#4ECDC4' }} />
                                <Line yAxisId="right" type="monotone" dataKey="confidence" stroke="#FFD93D" strokeWidth={2} strokeDasharray="5 5" />
                            </ComposedChart>
                        ) : selectedMetric === 'precipitation' ? (
                            <AreaChart data={predictionData}>
                                <defs>
                                    <linearGradient id="rainForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                <XAxis dataKey="date" stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <YAxis stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="precipitation" stroke="#4ECDC4" fill="url(#rainForecast)" />
                            </AreaChart>
                        ) : selectedMetric === 'wind' ? (
                            <LineChart data={predictionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                <XAxis dataKey="date" stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <YAxis stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Line type="monotone" dataKey="windSpeed" stroke="#FF6B6B" strokeWidth={3} dot={{ fill: '#FF6B6B', r: 5 }} />
                            </LineChart>
                        ) : (
                            <ComposedChart data={predictionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                <XAxis dataKey="date" stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <YAxis stroke={isDarkMode ? "#d1d5db" : "#666"} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Bar dataKey="precipitation" fill="#4ECDC4" opacity={0.6} />
                                <Line type="monotone" dataKey="temperature" stroke="#2F80ED" strokeWidth={2} />
                            </ComposedChart>
                        )}
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* Daily Forecast Cards */}
            <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Forecast Details</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 font-medium">
                        Next {predictionData.length} days ahead
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {predictionData.map((forecast, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -8 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{forecast.day}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{forecast.date}</p>
                                </div>
                                <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold">
                                    {forecast.confidence}%
                                </span>
                            </div>

                            <p className="text-2xl mb-2">{forecast.condition}</p>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">🌡️ Temp</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{forecast.temperature}°C</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400"><TrendingUp size={16} className="inline" /> Range</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{forecast.tempLow}°-{forecast.tempHigh}°C</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">💧 Rain</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{forecast.precipitation}mm</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">💨 Wind</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{forecast.windSpeed} km/h</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">☀️ UV</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{forecast.uvIndex}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Info Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800/30">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Forecast Accuracy</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Akurasi prediksi berkurang seiring waktu. Hari-hari awal memiliki akurasi hingga 90%, sementara hari ke-15 sekitar 60-70%.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-6 border border-purple-200 dark:border-purple-800/30">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Model Update</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Data prediksi diperbarui setiap 6 jam dengan observasi terbaru dan data satelit untuk hasil yang lebih akurat.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
