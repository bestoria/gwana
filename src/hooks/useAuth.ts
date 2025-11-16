import { useState, useEffect, useCallback, useMemo } from 'react';
import * as userService from '../services/userService';
import type { UserProfile } from '@/src/lib/types';

const SESSION_KEY = 'kwararru_session_userid';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
        const userId = localStorage.getItem(SESSION_KEY);
        if (userId) {
            const allUsers = userService.getAllUsers();
            const profile = allUsers.find(u => u.id === userId);

            if (profile) {
                // Perform subscription check on profile load
                if (profile.subscription.plan !== 'free' && profile.subscription.expiresAt && profile.subscription.expiresAt < Date.now()) {
                    profile.subscription.isActive = false;
                }
                // Reset free minutes if it's a new day
                if (profile.subscription.plan === 'free') {
                    const today = new Date().toISOString().split('T')[0];
                    if (profile.subscription.lastUsedDate !== today) {
                        profile.subscription.freeMinutesUsedToday = 0;
                        profile.subscription.lastUsedDate = today;
                    }
                }
                setCurrentUser(profile);
            } else {
                // Clean up invalid session
                localStorage.removeItem(SESSION_KEY);
                setCurrentUser(null);
            }
        } else {
            setCurrentUser(null);
        }
    } catch (e) {
        console.error("Error reading session from localStorage", e);
        setCurrentUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (phone: string, pin: string): Promise<{ success: boolean; message: string }> => {
    const result = userService.login(phone, pin);
    if (result.success && result.user) {
        localStorage.setItem(SESSION_KEY, result.user.id);
        setCurrentUser(result.user);
    }
    return { success: result.success, message: result.message };
  }, []);

  const signup = useCallback(async (name: string, phone: string, pin: string, gender: 'male' | 'female' | null): Promise<{ success: boolean; message: string }> => {
    const result = userService.createUser(name, phone, pin, gender);
    if (result.success && result.user) {
        localStorage.setItem(SESSION_KEY, result.user.id);
        setCurrentUser(result.user);
    }
    return { success: result.success, message: result.message };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const updateCurrentUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = userService.updateUser(currentUser.id, updates);
    if (updatedUser) {
        setCurrentUser(updatedUser);
    } else {
        console.error("Failed to update user profile in local storage.");
    }
  }, [currentUser]);

  const isSubscribed = useMemo(() => {
    if (!currentUser) return false;

    if (currentUser.subscription.plan !== 'free') {
      if (!currentUser.subscription.isActive) return false;
      if (!currentUser.subscription.expiresAt) return false;
      return currentUser.subscription.expiresAt > Date.now();
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (currentUser.subscription.lastUsedDate !== today) {
        return true;
    }
    return (currentUser.subscription.freeMinutesUsedToday || 0) < 300; // 5 minutes = 300 seconds
  }, [currentUser]);

  return {
    currentUser,
    isSubscribed,
    isLoading,
    login,
    signup,
    logout,
    updateCurrentUser,
  };
};