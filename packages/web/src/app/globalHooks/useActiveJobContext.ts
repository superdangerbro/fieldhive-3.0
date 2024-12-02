'use client';

import { create } from 'zustand';
import type { Job } from '../globalTypes/job';
import type { Property } from '../globalTypes/property';

interface ActiveJobState {
  activeJob: Job | null;
  activeProperty: Property | null;
  setActiveJob: (job: Job | null) => void;
  setActiveProperty: (property: Property | null) => void;
  clearContext: () => void;
}

// Load initial state from localStorage if available
const loadPersistedState = () => {
  if (typeof window === 'undefined') return { activeJob: null, activeProperty: null };
  
  try {
    const savedState = localStorage.getItem('activeJobState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading persisted state:', error);
  }
  return { activeJob: null, activeProperty: null };
};

export const useActiveJobContext = create<ActiveJobState>((set) => ({
  ...loadPersistedState(),
  setActiveJob: (job) => set(
    (state) => {
      const newState = { ...state, activeJob: job };
      localStorage.setItem('activeJobState', JSON.stringify(newState));
      return newState;
    }
  ),
  setActiveProperty: (property) => set(
    (state) => {
      const newState = { ...state, activeProperty: property };
      localStorage.setItem('activeJobState', JSON.stringify(newState));
      return newState;
    }
  ),
  clearContext: () => {
    localStorage.removeItem('activeJobState');
    set({ activeJob: null, activeProperty: null });
  }
}));
