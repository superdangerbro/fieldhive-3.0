'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number];
}

interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: [number, number][][];
}

interface LocationData {
    location?: {
        geometry: GeoJSONPoint;
    } | null;
    boundary?: {
        geometry: GeoJSONPolygon;
    } | null;
}

type Coordinate = [number, number];

const ENDPOINTS = {
    location: (id: string) => `/properties/${id}/location`,
    boundary: (id: string) => `/properties/${id}/boundary`
};

const buildUrl = (endpoint: string) => {
    const url = `${ENV_CONFIG.api.baseUrl}${endpoint}`;
    console.log('Building location URL:', url);
    return url;
};

// Helper function to validate coordinates
function validateCoordinates(coords: unknown): coords is Coordinate {
    if (!Array.isArray(coords) || coords.length !== 2) {
        console.warn('Invalid coordinates array:', coords);
        return false;
    }
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.warn('Invalid coordinate values:', { lng, lat });
        return false;
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        console.warn('Coordinates out of range:', { lng, lat });
        return false;
    }
    return true;
}

// Get property location data
export const usePropertyLocation = (propertyId: string) => {
    return useQuery<LocationData>({
        queryKey: ['propertyLocation', propertyId],
        queryFn: async () => {
            console.log('Fetching property location:', { propertyId });
            const url = buildUrl(ENDPOINTS.location(propertyId));
            console.log('API Request:', { method: 'GET', url });

            try {
                const response = await fetch(url, {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch property location');
                }

                const data = await response.json();
                console.log('Location API Response:', data);

                // Validate location data
                if (data.location?.geometry?.coordinates) {
                    if (!validateCoordinates(data.location.geometry.coordinates)) {
                        console.warn('Invalid location coordinates, setting to null');
                        data.location = null;
                    }
                }

                // Validate boundary data
                if (data.boundary?.geometry?.coordinates?.[0]) {
                    const isValid = data.boundary.geometry.coordinates[0].every(validateCoordinates);
                    if (!isValid) {
                        console.warn('Invalid boundary coordinates, setting to null');
                        data.boundary = null;
                    }
                }

                return data;
            } catch (error) {
                console.error('Failed to fetch location data:', error);
                throw error;
            }
        },
        enabled: !!propertyId,
        staleTime: ENV_CONFIG.queryClient.defaultStaleTime,
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
    });
};

// Update property location
export const useUpdatePropertyLocation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, coordinates }: { propertyId: string; coordinates: Coordinate }) => {
            console.log('Updating property location:', { propertyId, coordinates });

            if (!validateCoordinates(coordinates)) {
                throw new Error('Invalid coordinates provided');
            }

            const url = buildUrl(ENDPOINTS.location(propertyId));
            console.log('API Request:', { method: 'PUT', url, data: { coordinates } });

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to update property location');
            }

            const data = await response.json();
            console.log('Update Response:', data);
            return data;
        },
        onSuccess: (_, { propertyId }) => {
            console.log('Location update successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['propertyLocation', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        },
        onError: (error) => {
            console.error('Location update failed:', error);
        }
    });
};

// Update property boundary
export const useUpdatePropertyBoundary = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, coordinates }: { propertyId: string; coordinates: Coordinate[] }) => {
            console.log('Updating property boundary:', { propertyId, coordinates });

            // Validate all boundary coordinates
            const isValid = coordinates.every(validateCoordinates);
            if (!isValid) {
                throw new Error('Invalid boundary coordinates provided');
            }

            const url = buildUrl(ENDPOINTS.boundary(propertyId));
            console.log('API Request:', { method: 'PUT', url, data: { coordinates } });

            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coordinates }),
                signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
            });

            if (!response.ok) {
                throw new Error('Failed to update property boundary');
            }

            const data = await response.json();
            console.log('Update Response:', data);
            return data;
        },
        onSuccess: (_, { propertyId }) => {
            console.log('Boundary update successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['propertyLocation', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        },
        onError: (error) => {
            console.error('Boundary update failed:', error);
        }
    });
};
