import type { UserProfile, SubscriptionState } from '@/src/lib/types';

const USERS_KEY = 'kwararru_users';

// Internal type that includes the PIN for storage/authentication purposes.
// This is not exported to the rest of the application.
interface UserWithPin extends UserProfile {
  pin: string;
}


// --- Mock Database Functions ---

const saveUsers = (users: UserWithPin[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users to localStorage", e);
  }
};

const getUsers = (): UserWithPin[] => {
  try {
    const usersJSON = localStorage.getItem(USERS_KEY);
    let users: UserWithPin[] = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Seed a demo user if it doesn't exist
    if (!users.some((u: UserWithPin) => u.id === 'local_demo_user')) {
        users.push({
            id: 'local_demo_user',
            name: 'Demo User',
            phone: '+10001112222',
            pin: '123456',
            gender: 'male',
            subscription: {
              isActive: true,
              expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year from now
              plan: 'annually',
              freeMinutesUsedToday: 0,
              lastUsedDate: new Date().toISOString().split('T')[0],
            },
        });
        saveUsers(users);
    }

    return users;
  } catch (e) {
    console.error("Failed to parse users from localStorage", e);
    return [];
  }
};

// --- Service Functions ---

export const getUser = (phone: string): UserProfile | null => {
  const users = getUsers();
  const user = users.find(user => user.phone === phone);
  if (!user) return null;
  const { pin, ...userProfile } = user;
  return userProfile;
};

export const getAllUsers = (): UserProfile[] => {
  // Return a list of profiles without pins.
  return getUsers().map(({ pin, ...profile }) => profile);
};

export const createUser = (name: string, phone: string, pin: string, gender: 'male' | 'female' | null): { success: boolean, message: string, user?: UserProfile } => {
  const users = getUsers();
  if (users.find(user => user.phone === phone)) {
    return { success: false, message: 'A user with this phone number already exists.' };
  }

  const newUser: UserWithPin = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    phone,
    pin, // Store the PIN
    gender,
    subscription: {
      isActive: true, // Free plan is always 'active' in a sense
      expiresAt: null,
      plan: 'free',
      freeMinutesUsedToday: 0,
      lastUsedDate: new Date().toISOString().split('T')[0],
    },
  };

  saveUsers([...users, newUser]);

  // Return a profile that does NOT include the pin.
  const { pin: _, ...userProfile } = newUser;
  return { success: true, message: 'Account created successfully.', user: userProfile };
};

export const updateUser = (userId: string, updates: Partial<UserProfile>): UserProfile | null => {
  let users = getUsers();
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return null;
  }
  
  // Merge updates, ensuring the subscription object is also merged correctly
  const updatedUser = {
      ...users[userIndex],
      ...updates,
      subscription: {
          ...users[userIndex].subscription,
          ...updates.subscription
      }
  };

  users[userIndex] = updatedUser;
  saveUsers(users);
  
  // Return a profile that does NOT include the pin.
  const { pin, ...userProfile } = users[userIndex];
  return userProfile;
};

export const login = (phone: string, pin: string): { success: boolean, message: string, user?: UserProfile } => {
  const users = getUsers();
  const user = users.find(u => u.phone === phone);

  if (!user) {
    return { success: false, message: 'No account found with this phone number.' };
  }

  if (user.pin !== pin) {
    return { success: false, message: 'Incorrect PIN.' };
  }

  // Return a profile that does NOT include the pin.
  const { pin: _, ...userProfile } = user;
  return { success: true, message: 'Login successful.', user: userProfile };
};