'use client';

export const handleApiError = async (response: Response) => {
    try {
        const error = await response.json();
        console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error
        });
        throw new Error(error.message || 'An error occurred');
    } catch (e) {
        console.error('Failed to parse error response:', e);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
};
