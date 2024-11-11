'use client';

import { ENV_CONFIG } from '../../../../config/environment';

interface ApiError {
    message?: string;
    code?: string;
    details?: any;
}

export const handleApiError = async (response: Response) => {
    try {
        const error = await response.json() as ApiError;
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error
        });

        // Handle specific error codes
        switch (response.status) {
            case 401:
                throw new Error('Authentication required. Please log in and try again.');
            case 403:
                throw new Error('You do not have permission to perform this action.');
            case 404:
                throw new Error('The requested resource was not found.');
            case 429:
                throw new Error('Too many requests. Please try again later.');
            case 500:
                throw new Error('An internal server error occurred. Please try again later.');
            default:
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (e) {
        if (e instanceof Error) {
            throw e; // Re-throw if it's already a handled error
        }
        console.error('Failed to parse error response:', e);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
};

export const buildApiRequest = (options: RequestInit = {}): RequestInit => {
    return {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
    };
};

export const formatErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
};

export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = ENV_CONFIG.api.maxRetries
): Promise<T> => {
    let retries = 0;
    let lastError: unknown;

    do {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            retries++;

            if (retries > maxRetries) {
                throw error;
            }

            const delay = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`Retry ${retries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    } while (retries <= maxRetries);

    // This should never be reached due to the return or throw above,
    // but TypeScript needs it for type safety
    throw lastError;
};
