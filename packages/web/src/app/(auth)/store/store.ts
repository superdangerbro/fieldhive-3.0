'use client';

import { create } from 'zustand';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthStore {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  
  // Token Management
  getToken: () => string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
  isAuthenticated: () => boolean;
}

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { token, user } = await response.json();
      get().setToken(token);
      set({ user });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await fetch('/api/auth/logout', { method: 'POST' });
      get().removeToken();
      set({ user: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Logout failed' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        set({ user: null });
        return;
      }

      const user = await response.json();
      set({ user });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get user' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Token Management
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!get().getToken();
  }
}));
