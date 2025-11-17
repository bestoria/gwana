import React from 'react';
import { User, LogOut } from 'lucide-react';
import type { UserProfile } from '@/src/core/types';

interface ProfileSectionProps {
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  currentUser,
  onLogout
}) => {
  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Not logged in</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User size={20} className="text-primary" />
          Profile
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{currentUser.name}</h4>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
