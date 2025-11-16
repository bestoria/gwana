import React, { useEffect } from 'react';
import { X, BarChart3, PieChart as PieChartIcon, MessageSquare } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import type { CallRecord } from '@/src/lib/types';

interface StatsModalProps {
  stats: {
    totalMessages: number;
    userMessages: number;
    botMessages: number;
    imageMessages: number;
    voiceMessages: number;
    starredMessages: number;
  };
  callHistory: CallRecord[];
  onClose: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/70 backdrop-blur-sm border border-cyan-500/50 p-3 rounded-md font-mono text-sm">
        <p className="label text-cyan-300">{`${label || payload[0].name} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const StatsModal: React.FC<StatsModalProps> = ({ stats, callHistory, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const messageDistributionData = [
    { name: 'User', value: stats.userMessages },
    { name: 'AI', value: stats.botMessages },
  ];
  const COLORS = ['var(--accent-cyan)', 'var(--accent-magenta)'];

  const textMessages = stats.totalMessages - stats.imageMessages - stats.voiceMessages;
  const contentTypeData = [
    { name: 'Text', value: textMessages, fill: 'rgba(136, 132, 216, 0.7)' },
    { name: 'Images', value: stats.imageMessages, fill: 'rgba(130, 202, 157, 0.7)' },
    { name: 'Audio', value: stats.voiceMessages, fill: 'rgba(255, 198, 88, 0.7)' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-md animate-glitch-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-title"
    >
      <div
        className="bg-black/50 border border-[var(--border-color)] rounded-lg p-6 max-w-3xl w-full shadow-2xl"
        style={{ boxShadow: '0 0 20px var(--accent-cyan)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="stats-title" className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            <BarChart3 size={24} /> System Analytics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
          {/* Message Distribution Chart */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <PieChartIcon size={18} /> Message Distribution
            </h3>
            <div className="w-full h-64 bg-black/30 p-2 rounded-md border border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}/>
                  <Pie
                    data={messageDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (percent === 0) return null;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                      const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {messageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} formatter={(value, entry) => <span style={{color: entry.color}}>{value}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Content Type Chart */}
          <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <MessageSquare size={18} /> Content Types
            </h3>
            <div className="w-full h-64 bg-black/30 p-2 rounded-md border border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contentTypeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 255, 0.1)' }}/>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                     {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800/50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-200">{stats.totalMessages}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-200">{stats.starredMessages}</div>
              <div className="text-xs text-gray-400">Starred</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-200">{callHistory.length}</div>
              <div className="text-xs text-gray-400">Calls</div>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-200">
                {Math.round(callHistory.reduce((acc, call) => acc + call.duration, 0) / 60)}
                <span className="text-base">min</span>
              </div>
              <div className="text-xs text-gray-400">Call Time</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
