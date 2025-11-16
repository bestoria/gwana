import React from 'react';
import SettingsScreen from '@/src/components/SettingsScreen';
import type { Settings, UserProfile } from '@/src/core/types';

interface SettingsAppProps {
  settings: Settings;
  currentUser: UserProfile | null;
  onSettingChange: (key: keyof Settings, value: any) => void;
  onLogout: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = (props) => {
  return (
    <div className="h-full w-full overflow-auto">
      <SettingsScreen {...props} />
    </div>
  );
};
