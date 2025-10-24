import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function PredictionChart() {
  const [timeRange, setTimeRange] = useState<'12h' | '3d' | '7d'>('12h');

  const data12h = [
    { time: '6:00', temp: 22 },
    { time: '8:00', temp: 24 },
    { time: '10:00', temp: 25 },
    { time: '12:00', temp: 27 },
    { time: '14:00', temp: 28 },
    { time: '16:00', temp: 28 },
    { time: '18:00', temp: 26 },
    { time: '20:00', temp: 24 },
    { time: '22:00', temp: 23 },
    { time: '0:00', temp: 22 },
    { time: '2:00', temp: 21 },
    { time: '4:00', temp: 21 },
  ];

  const data3d = [
    { time: 'Today', temp: 26 },
    { time: 'Tomorrow', temp: 28 },
    { time: 'Day 3', temp: 24 },
  ];

  const data7d = [
    { time: 'Mon', temp: 26 },
    { time: 'Tue', temp: 28 },
    { time: 'Wed', temp: 27 },
    { time: 'Thu', temp: 25 },
    { time: 'Fri', temp: 24 },
    { time: 'Sat', temp: 26 },
    { time: 'Sun', temp: 27 },
  ];

  const getData = () => {
    switch (timeRange) {
      case '12h': return data12h;
      case '3d': return data3d;
      case '7d': return data7d;
      default: return data12h;
    }
  };

  const currentData = getData();

  return (
    <motion.div 
      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-white/50 dark:border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-gray-900 dark:text-white text-sm">Temperature Forecast</h2>
        
        <div className="flex gap-1.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-xl p-1">
          <button
            onClick={() => setTimeRange('12h')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              timeRange === '12h'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
            }`}
          >
            12h
          </button>
          <button
            onClick={() => setTimeRange('3d')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              timeRange === '3d'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
            }`}
          >
            3d
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
              timeRange === '7d'
                ? 'bg-gradient-to-r from-[#2F80ED] to-[#56CCF2] text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/50'
            }`}
          >
            7d
          </button>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F80ED" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#56CCF2" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#BBE1FA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#94A3B8"
              style={{ fontSize: '11px', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis 
              stroke="#94A3B8"
              style={{ fontSize: '11px', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}°`}
              dx={-8}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                padding: '8px 12px',
                fontSize: '12px',
              }}
              formatter={(value: any) => [`${value}°C`, 'Temp']}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#2F80ED" 
              strokeWidth={2.5}
              fill="url(#tempGradient)"
              dot={{ r: 3, fill: '#2F80ED', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#2F80ED', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}