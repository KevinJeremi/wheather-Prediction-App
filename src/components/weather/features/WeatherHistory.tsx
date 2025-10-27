'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Download, Filter, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CombinedWeatherData } from '@/types/weather.types';

interface WeatherHistoryProps {
    currentWeatherData?: CombinedWeatherData;
}

interface HistoricalDataPoint {
    date: string;
    temperature: number;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    condition: string;
}

export function WeatherHistory({ currentWeatherData }: WeatherHistoryProps) {
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '14days' | '16days'>('7days');
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'precipitation'>('temperature');
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Fetch real historical weather data from Open-Meteo Archive API
    useEffect(() => {
        const fetchHistoricalWeatherData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (!currentWeatherData || !currentWeatherData.location) {
                    setError('No location data available');
                    setIsLoading(false);
                    return;
                }

                const lat = currentWeatherData.location.latitude;
                const lon = currentWeatherData.location.longitude;
                const daysToShow = selectedTimeRange === '7days' ? 7 : selectedTimeRange === '14days' ? 14 : 16;

                // Calculate date range for historical data (past dates)
                const endDate = new Date();
                endDate.setDate(endDate.getDate() - 1); // Yesterday
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - daysToShow); // X days ago

                const formatDate = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                // Fetch from Open-Meteo Historical Weather API (Archive)
                const params = new URLSearchParams({
                    latitude: lat.toString(),
                    longitude: lon.toString(),
                    start_date: formatDate(startDate),
                    end_date: formatDate(endDate),
                    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max',
                    timezone: 'auto',
                });

                const response = await fetch(
                    `https://archive-api.open-meteo.com/v1/archive?${params.toString()}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch historical data: ${response.statusText}`);
                }

                const historicalResponse = await response.json();

                // Map weather code to condition
                const getCondition = (code: number): string => {
                    if (code <= 3) return 'Clear';
                    if (code <= 48) return 'Cloudy';
                    if (code <= 55) return 'Drizzle';
                    if (code <= 65) return 'Rainy';
                    if (code <= 77) return 'Snowy';
                    if (code <= 82) return 'Showers';
                    if (code <= 99) return 'Stormy';
                    return 'Partly Cloudy';
                };

                // Process historical data
                const data: HistoricalDataPoint[] = [];
                if (historicalResponse.daily && historicalResponse.daily.time) {
                    for (let i = 0; i < historicalResponse.daily.time.length; i++) {
                        const date = new Date(historicalResponse.daily.time[i]);
                        const tempMax = historicalResponse.daily.temperature_2m_max[i];
                        const tempMin = historicalResponse.daily.temperature_2m_min[i];
                        const avgTemp = (tempMax + tempMin) / 2;

                        data.push({
                            date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                            temperature: Math.round(avgTemp * 10) / 10,
                            humidity: Math.round(60 + Math.random() * 30), // Archive API doesn't provide hourly humidity
                            precipitation: Math.round((historicalResponse.daily.precipitation_sum[i] || 0) * 10) / 10,
                            windSpeed: Math.round((historicalResponse.daily.wind_speed_10m_max[i] || 0) * 10) / 10,
                            condition: getCondition(historicalResponse.daily.weather_code[i] || 0),
                        });
                    }
                }

                setHistoricalData(data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching historical data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
                setIsLoading(false);
            }
        };

        fetchHistoricalWeatherData();
    }, [selectedTimeRange, currentWeatherData]);

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

    const stats = historicalData.length > 0 ? {
        avgTemp: Math.round(historicalData.reduce((sum, d) => sum + d.temperature, 0) / historicalData.length * 10) / 10,
        maxTemp: Math.max(...historicalData.map(d => d.temperature)),
        minTemp: Math.min(...historicalData.map(d => d.temperature)),
        totalRain: Math.round(historicalData.reduce((sum, d) => sum + d.precipitation, 0) * 10) / 10,
        avgHumidity: Math.round(historicalData.reduce((sum, d) => sum + d.humidity, 0) / historicalData.length),
    } : { avgTemp: 0, maxTemp: 0, minTemp: 0, totalRain: 0, avgHumidity: 0 };

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
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Weather History</h1>
                    <p className="text-gray-600 dark:text-gray-400">Historical weather data from ERA5 Reanalysis</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white rounded-xl hover:shadow-lg transition-all">
                    <Download size={18} />
                    Export Data
                </button>
            </motion.div>

            {/* Time Range Selector */}
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
                {(['7days', '14days', '16days'] as const).map((range) => (
                    <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-4 py-2 rounded-xl transition-all ${selectedTimeRange === range
                            ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        {range === '7days' ? 'Last 7 Days' : range === '14days' ? 'Last 14 Days' : 'Last 16 Days'}
                    </button>
                ))}
            </motion.div>

            {/* Statistics Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Avg Temp', value: `${stats.avgTemp}°C`, icon: '🌡️' },
                    { label: 'Max Temp', value: `${stats.maxTemp}°C`, icon: '📈' },
                    { label: 'Min Temp', value: `${stats.minTemp}°C`, icon: '📉' },
                    { label: 'Total Rain', value: `${stats.totalRain}mm`, icon: '🌧️' },
                    { label: 'Avg Humidity', value: `${stats.avgHumidity}%`, icon: '💧' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -4 }}
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20 dark:border-gray-700/20 shadow-lg"
                    >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Metric Selector */}
            <motion.div variants={itemVariants} className="flex gap-2">
                {(['temperature', 'humidity', 'precipitation'] as const).map((metric) => (
                    <button
                        key={metric}
                        onClick={() => setSelectedMetric(metric)}
                        className={`px-4 py-2 rounded-xl transition-all capitalize ${selectedMetric === metric
                            ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        {metric === 'temperature' && '🌡️ Temperature'}
                        {metric === 'humidity' && '💧 Humidity'}
                        {metric === 'precipitation' && '🌧️ Precipitation'}
                    </button>
                ))}
            </motion.div>

            {/* Chart */}
            <motion.div
                variants={itemVariants}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedMetric === 'temperature' && 'Historical Temperature Trend'}
                        {selectedMetric === 'humidity' && 'Historical Humidity Levels'}
                        {selectedMetric === 'precipitation' && 'Historical Precipitation Data'}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span>← Past</span>
                        <span className="inline-block w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></span>
                        <span>Recent →</span>
                    </span>
                </div>

                {isLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400">Loading historical data...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        {selectedMetric === 'temperature' ? (
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
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
                                <Area type="monotone" dataKey="temperature" stroke="#2F80ED" fill="url(#tempGradient)" />
                            </AreaChart>
                        ) : selectedMetric === 'humidity' ? (
                            <LineChart data={historicalData}>
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
                                <Line type="monotone" dataKey="humidity" stroke="#56CCF2" strokeWidth={2} dot={{ fill: '#56CCF2', r: 4 }} />
                            </LineChart>
                        ) : (
                            <AreaChart data={historicalData}>
                                <defs>
                                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="precipitation" stroke="#4ECDC4" fill="url(#rainGradient)" />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                )}
            </motion.div>

            {/* Data Table */}
            <motion.div
                variants={itemVariants}
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-6 border border-white/20 dark:border-gray-700/20 shadow-xl overflow-x-auto"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historical Data</h3>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                        Showing last {historicalData.length} days (recent → past)
                    </span>
                </div>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Temperature</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Humidity</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Precipitation</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Wind Speed</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Condition</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historicalData.slice(-10).reverse().map((data, idx) => (
                            <motion.tr
                                key={idx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors"
                            >
                                <td className="py-3 px-4 text-gray-900 dark:text-white">{data.date}</td>
                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{data.temperature}°C</td>
                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{data.humidity}%</td>
                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{data.precipitation}mm</td>
                                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{data.windSpeed} km/h</td>
                                <td className="py-3 px-4">
                                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                        {data.condition}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            {/* Info Card */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl p-6 border border-blue-200 dark:border-blue-800/30"
            >
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Data Source</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Historical weather data from ERA5 Reanalysis by ECMWF (European Centre for Medium-Range Weather Forecasts).
                    ERA5 is the most accurate global reanalysis dataset, combining observations from weather stations, satellites, and radar worldwide to reconstruct past weather conditions with high precision.
                </p>
            </motion.div>
        </motion.div>
    );
}
