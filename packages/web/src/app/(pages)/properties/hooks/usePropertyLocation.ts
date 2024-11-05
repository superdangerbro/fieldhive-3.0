import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

const PROPERTIES_ENDPOINT = '/properties';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

interface LocationData {
    location: {
        type: 'Feature';
        geometry: {
            type: 'Point';
            coordinates: [number, number];
        };
        properties: {};
    };
    boundary?: {
        type: 'Feature';
        geometry: {
            type: 'Polygon';
            coordinates: [number, number][][];
        };
        properties: {};
    };
}

// Get property location
export const usePropertyLocation = (propertyId: string) => {
    return useQuery({
        queryKey: ['property', propertyId, 'location'],
        queryFn: async () => {
            const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${propertyId}/location`), {
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch property location');
            }

            const data = await response.json();
            return data.data as LocationData;
        },
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update property location
export const useUpdatePropertyLocation = () => {
    const queryClient = useQueryClient();

    return useMutation<
        LocationData,
        Error,
        { propertyId: string; coordinates: [number, number] }
    >({
        mutationFn: async ({ propertyId, coordinates }) => {
            const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${propertyId}/location`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update property location');
            }

            const data = await response.json();
            return data.data as LocationData;
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ 
                queryKey: ['property', propertyId, 'location']
            });
        },
    });
};

// Update property boundary
export const useUpdatePropertyBoundary = () => {
    const queryClient = useQueryClient();

    return useMutation<
        LocationData,
        Error,
        { propertyId: string; coordinates: [number, number][] }
    >({
        mutationFn: async ({ propertyId, coordinates }) => {
            const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${propertyId}/boundary`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update property boundary');
            }

            const data = await response.json();
            return data.data as LocationData;
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ 
                queryKey: ['property', propertyId, 'location']
            });
        },
    });
};
