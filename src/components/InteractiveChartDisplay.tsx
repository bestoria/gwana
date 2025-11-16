import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Line
} from 'recharts';
import type { InteractiveChartContent } from '../lib/types';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/70 backdrop-blur-sm border border-cyan-500/50 p-3 rounded-md font-mono text-sm">
          <p className="label text-cyan-300">{label}</p>
          {payload.map((pld: any, index: number) => (
              <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
          ))}
        </div>
      );
    }
    return null;
};
  

const InteractiveChartDisplay: React.FC<{ chartData: InteractiveChartContent }> = ({ chartData }) => {
    const renderChart = () => {
        const commonProps = {
            data: chartData.data,
            margin: { top: 5, right: 20, left: -10, bottom: 5 }
        };

        if (chartData.chartType === 'bar') {
            return (
                <BarChart {...commonProps}>
                    <CartesianGrid stroke="rgba(0, 255, 255, 0.1)" />
                    <XAxis dataKey={chartData.xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 255, 0.1)' }}/>
                    <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} formatter={(value, entry) => <span style={{color: entry.color}}>{value}</span>}/>
                    {chartData.yAxisKeys.map(item => (
                        <Bar key={item.key} type="monotone" dataKey={item.key} stroke={item.color} fill={item.color} />
                    ))}
                </BarChart>
            );
        } else {
            return (
                <LineChart {...commonProps}>
                    <CartesianGrid stroke="rgba(0, 255, 255, 0.1)" />
                    <XAxis dataKey={chartData.xAxisKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 255, 0.1)' }}/>
                    <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}} formatter={(value, entry) => <span style={{color: entry.color}}>{value}</span>}/>
                    {chartData.yAxisKeys.map(item => (
                        <Line key={item.key} type="monotone" dataKey={item.key} stroke={item.color} fill={item.color} />
                    ))}
                </LineChart>
            );
        }
    };


    return (
        <div className="mt-2 p-3 border border-cyan-500/50 bg-black/30 rounded-lg font-mono text-xs max-w-xl relative">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3" style={{ textShadow: '0 0 4px var(--accent-cyan)' }}>
                INTERACTIVE CHART: {chartData.title.toUpperCase()}
            </h3>
            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default InteractiveChartDisplay;
