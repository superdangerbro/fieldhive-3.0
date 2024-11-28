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

export const useActiveJobContext = create<ActiveJobState>((set) => ({
  activeJob: null,
  activeProperty: null,
  setActiveJob: (job) => set({ activeJob: job }),
  setActiveProperty: (property) => set({ activeProperty: property }),
  clearContext: () => set({ activeJob: null, activeProperty: null })
}));
