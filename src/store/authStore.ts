import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7002';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  checkAuth: async () => {
    try {
      // Include credentials to send cookies
      const res = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include' 
      });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Auth check failed', error);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
      set({ user: null });
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}));
