import React from 'react';
import { Settings as SettingsIcon, Palette, Volume2 } from 'lucide-react';
import type { Settings } from '@/src/core/types';

interface SettingsPanelProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings, value: any) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingChange
}) => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <SettingsIcon size={20} className="text-primary" />
          General Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => onSettingChange('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Sound Effects</p>
              <p className="text-sm text-muted-foreground">Enable UI sound effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onSettingChange('soundEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="font-medium text-foreground">Animations</p>
              <p className="text-sm text-muted-foreground">Enable smooth animations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => onSettingChange('animationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="mb-2">
              <p className="font-medium text-foreground">Volume</p>
              <p className="text-sm text-muted-foreground">Adjust audio volume</p>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => onSettingChange('volume', parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">{settings.volume}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};
