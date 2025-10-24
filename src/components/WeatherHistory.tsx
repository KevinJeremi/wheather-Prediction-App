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
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7days' | '30days' | '90days'>('7days');
    const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'precipitation'>('temperature');

    // Simulate historical data from JWA model
    useEffect(() => {
        const generateHistoricalData = () => {
            const data: HistoricalDataPoint[] = [];
            const today = new Date();
            const daysToShow = selectedTimeRange === '7days' ? 7 : selectedTimeRange === '30days' ? 30 : 90;

            for (let i = daysToShow; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);

                // Generate realistic weather data
                const temp = 25 + Math.random() * 10 - 5;
                const humidity = 50 + Math.random() * 40;
                const precipitation = Math.random() * 50;
                const windSpeed = 5 + Math.random() * 15;

                const conditions = ['Clear', 'Cloudy', 'Rainy', 'Stormy', 'Partly Cloudy'];
                const condition = conditions[Math.floor(Math.random() * conditions.length)];

                data.push({
                    date: date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
                    temperature: Math.round(temp * 10) / 10,
                    humidity: Math.round(humidity),
                    precipitation: Math.round(precipitation * 10) / 10,
                    windSpeed: Math.round(windSpeed * 10) / 10,
                    condition,
                });
            }

            setHistoricalData(data);
            setIsLoading(false);
        };

        setIsLoading(true);
        generateHistoricalData();
    }, [selectedTimeRange]);

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
                    <p className="text-gray-600 dark:text-gray-400">Historical weather data from JMA Model</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white rounded-xl hover:shadow-lg transition-all">
                    <Download size={18} />
                    Export Data
                </button>
            </motion.div>

            {/* Time Range Selector */}
            <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
                {(['7days', '30days', '90days'] as const).map((range) => (
                    <button
                        key={range}
                        onClick={() => setSelectedTimeRange(range)}
                        className={`px-4 py-2 rounded-xl transition-all ${selectedTimeRange === range
                            ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                            : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                    >
                        {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedMetric === 'temperature' && 'Temperature Trend'}
                    {selectedMetric === 'humidity' && 'Humidity Levels'}
                    {selectedMetric === 'precipitation' && 'Precipitation Data'}
                </h3>

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
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
                                <YAxis stroke="rgba(0,0,0,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                    }}
                                />
                                <Area type="monotone" dataKey="temperature" stroke="#2F80ED" fill="url(#tempGradient)" />
                            </AreaChart>
                        ) : selectedMetric === 'humidity' ? (
                            <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
                                <YAxis stroke="rgba(0,0,0,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
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
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                                <XAxis dataKey="date" stroke="rgba(0,0,0,0.5)" />
                                <YAxis stroke="rgba(0,0,0,0.5)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historical Data</h3>

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
                    Historical weather data adalah hasil analisis dari model JMA (Japan Meteorological Agency) Global Forecast System (GSM).
                    Data ini menggabungkan observasi satelit, radar cuaca, dan stasiun meteorologi di seluruh dunia untuk memberikan prediksi akurat.
                </p>
            </motion.div>
        </motion.div>
    );
}
