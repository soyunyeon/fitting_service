import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '../lib/api'; // Import UserInfo from api.ts

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  credits: number;
  setAuth: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  updateCredits: (amount: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      credits: 50, // Default credits, can be updated from API later

      setAuth: (token, userInfo) => set({ token, userInfo, credits: userInfo.credits ?? 50 }), // Assuming credits might be part of UserInfo or default
      logout: () => set({ token: null, userInfo: null, credits: 50 }), // Reset to default on logout
      updateCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);
