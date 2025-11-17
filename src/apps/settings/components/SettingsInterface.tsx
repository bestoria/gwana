import React, { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { ProfileSection } from './ProfileSection';
import { WorkflowManager } from './WorkflowManager';
import type { Settings, UserProfile, Workflow } from '@/src/core/types';

interface SettingsInterfaceProps {
  settings: Settings;
  currentUser: UserProfile | null;
  workflows?: Workflow[];
  onSettingChange: (key: keyof Settings, value: any) => void;
  onLogout: () => void;
}

export const SettingsInterface: React.FC<SettingsInterfaceProps> = ({
  settings,
  currentUser,
  workflows = [],
  onSettingChange,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'profile' | 'workflows'>('general');

  return (
    <div className="flex h-full bg-background">
      <div className="w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        </div>
        
        <nav className="p-2">
          {[
            { id: 'general' as const, label: 'General' },
            { id: 'profile' as const, label: 'Profile' },
            { id: 'workflows' as const, label: 'Workflows' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'general' && (
          <SettingsPanel
            settings={settings}
            onSettingChange={onSettingChange}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileSection
            currentUser={currentUser}
            onLogout={onLogout}
          />
        )}
        {activeTab === 'workflows' && (
          <WorkflowManager
            workflows={workflows}
          />
        )}
      </div>
    </div>
  );
};
