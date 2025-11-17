import React from 'react';
import { SettingsInterface } from './components/SettingsInterface';
import type { Settings, UserProfile, Workflow } from '@/src/core/types';

interface SettingsAppProps {
  settings: Settings;
  currentUser: UserProfile | null;
  workflows?: Workflow[];
  onSettingChange: (key: keyof Settings, value: any) => void;
  onLogout: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = (props) => {
  return (
    <div className="h-full w-full">
      <SettingsInterface {...props} />
    </div>
  );
};
