'use client';

import { create } from 'zustand';
import { Job, CreateJobDto, UpdateJobDto, JobResponse } from '@/app/globalTypes/job';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const JOBS_ENDPOINT = '/jobs';

interface JobStore {
    // State
    jobs: Job[];
    selectedJob: Job | null;
    isLoading: boolean;
    error: string | null;

    // Selection Actions
    setSelectedJob: (job: Job | null) => void;
    setJobs: (jobs: Job[]) => void;

    // CRUD Actions
    fetchJobs: (params?: { 
        search?: string; 
        limit?: number; 
        offset?: number; 
        accountId?: string;
        propertyId?: string;
    }) => Promise<void>;
    createJob: (data: CreateJobDto) => Promise<void>;
    updateJob: (id: string, data: UpdateJobDto) => Promise<void>;
    deleteJob: (id: string) => Promise<{ success: boolean; error?: string }>;
    archiveJob: (id: string) => Promise<{ success: boolean }>;

    // Metadata Actions
    updateJobMetadata: (id: string, metadata: { 
        type?: string; 
        status?: string 
    }) => Promise<void>;
}

// Helper function to convert API response to Job type
const convertToJob = (data: any): Job => ({
    ...data,
    created_at: data.created_at ? new Date(data.created_at) : undefined,
    updated_at: data.updated_at ? new Date(data.updated_at) : undefined
});

export const useJobStore = create<JobStore>((set, get) => ({
    // Initial state
    jobs: [],
    selectedJob: null,
    isLoading: false,
    error: null,

    // Selection Actions
    setSelectedJob: (job) => {
        set({ selectedJob: job });
    },

    setJobs: (jobs) => {
        set({ jobs });
    },

    // CRUD Actions
    fetchJobs: async (params) => {
        try {
            set({ isLoading: true, error: null });
            const searchParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        searchParams.append(key, String(value));
                    }
                });
            }
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}?${searchParams}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch jobs');
            }

            const data: JobResponse = await response.json();
            const jobs = data.jobs.map(convertToJob);
            set({ jobs });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch jobs' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createJob: async (data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to create job');
            }

            const newJob = convertToJob(await response.json());
            set(state => ({
                jobs: [...state.jobs, newJob]
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create job' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateJob: async (id, data) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update job');
            }

            const updatedJob = convertToJob(await response.json());
            set(state => ({
                jobs: state.jobs.map(j => 
                    j.job_id === id ? updatedJob : j
                ),
                selectedJob: state.selectedJob?.job_id === id ? 
                    updatedJob : state.selectedJob
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update job' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteJob: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete job');
            }

            const result = await response.json();
            if (result.success) {
                set(state => ({
                    jobs: state.jobs.filter(j => j.job_id !== id),
                    selectedJob: state.selectedJob?.job_id === id ? 
                        null : state.selectedJob
                }));
            }
            return result;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete job' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    archiveJob: async (id) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}/${id}/archive`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to archive job');
            }

            return await response.json();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to archive job' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Metadata Actions
    updateJobMetadata: async (id, metadata) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`${BASE_URL}${JOBS_ENDPOINT}/${id}/metadata`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata)
            });

            if (!response.ok) {
                throw new Error('Failed to update job metadata');
            }

            const updatedJob = convertToJob(await response.json());
            set(state => ({
                jobs: state.jobs.map(j => 
                    j.job_id === id ? updatedJob : j
                ),
                selectedJob: state.selectedJob?.job_id === id ? 
                    updatedJob : state.selectedJob
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update job metadata' });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    }
}));
