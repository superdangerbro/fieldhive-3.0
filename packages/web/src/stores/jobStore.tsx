import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job } from '@fieldhive/shared';

interface JobStore {
    selectedJob: Job | null;
    setSelectedJob: (job: Job | null) => void;
}

export const useJobs = create<JobStore>()(
    persist(
        (set) => ({
            selectedJob: null,
            setSelectedJob: (job) => set({ selectedJob: job }),
        }),
        {
            name: 'job-store',
        }
    )
);
