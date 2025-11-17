import React from 'react';
import { LayoutDashboard, TrendingUp, Users, Activity } from 'lucide-react';

export const DashboardInterface: React.FC = () => {
  const stats = [
    { label: 'Active Users', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Engagement', value: '89%', icon: Activity, change: '+5%' },
    { label: 'Growth Rate', value: '23%', icon: TrendingUp, change: '+8%' }
  ];

  return (
    <div className="h-full overflow-auto bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-primary" size={24} />
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-6 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="text-primary" size={20} />
                <span className="text-xs font-medium text-green-500">{stat.change}</span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-accent/50 rounded-md">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <p className="text-sm text-foreground">Activity item {i}</p>
                <span className="ml-auto text-xs text-muted-foreground">Just now</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
