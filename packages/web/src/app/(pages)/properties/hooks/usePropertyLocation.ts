'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '@/config/environment';

const PROPERTIES_ENDPOINT = '/properties';

// Helper function to build full API URL
const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

interface GeoJSONFeature<G> {
    type: 'Feature';
    geometry: G;
    properties: Record<string, any>;
}

interface PointGeometry {
    type: 'Point';
    coordinates: [number, number];
}

interface PolygonGeometry {
    type: 'Polygon';
    coordinates: [number, number][][];
}

interface LocationData {
    location: GeoJSONFeature<PointGeometry> | null;
    boundary: GeoJSONFeature<PolygonGeometry> | null;
}

// Helper function to create a GeoJSON Feature
function createGeoJSONFeature<G>(geometry: G): GeoJSONFeature<G> {
    return {
        type: 'Feature',
        geometry,
        properties: {}
    };
}

// Validate GeoJSON coordinates
function validateGeoJSONCoordinates(coordinates: [number, number]): boolean {
    const [lng, lat] = coordinates;
    return !isNaN(lng) && !isNaN(lat) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180;
}

// Validate polygon coordinates
function validatePolygonCoordinates(coordinates: [number, number][]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length < 3) {
        return false;
    }
    return coordinates.every(coord => validateGeoJSONCoordinates(coord));
}

// Get property location
export const usePropertyLocation = (propertyId: string) => {
    return useQuery({
        queryKey: ['property', propertyId, 'location'],
        queryFn: async () => {
            try {
                const response = await fetch(buildUrl(`${PROPERTIES_ENDPOINT}/${propertyId}/location`), {
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(ENV_CONFIG.api.timeout),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch property location');
                }

                const data = await response.json();
                console.log('Raw location data from API:', data);

                // Validate location data if present
                if (data.location) {
                    if (!validateGeoJSONCoordinates(data.location.coordinates)) {
                        console.warn('Invalid location coordinates received:', data.location.coordinates);
                        data.location = null;
                    }
                }

                // Validate boundary data if present
                if (data.boundary) {
                    const coordinates = data.boundary.coordinates[0];
                    if (!validatePolygonCoordinates(coordinates)) {
                        console.warn('Invalid boundary coordinates received:', coordinates);
                        data.boundary = null;
                    }
                }

                // Convert valid GeoJSON to Feature objects
                return {
                    location: data.location ? createGeoJSONFeature(data.location) : null,
                    boundary: data.boundary ? createGeoJSONFeature(data.boundary) : null
                } as LocationData;
            } catch (error) {
                console.error('Error fetching location data:', error);
                throw new Error('Failed to fetch property location data');
            }
        },
        staleTime: 0, // Always fetch fresh data when component mounts
        gcTime: ENV_CONFIG.queryClient.defaultCacheTime,
        retry: 2, // Retry failed requests twice
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
            // Validate coordinates before sending
            if (!validateGeoJSONCoordinates(coordinates)) {
                throw new Error('Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90.');
            }

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
            console.log('Location update response:', data);

            // Validate received data
            if (data.location && !validateGeoJSONCoordinates(data.location.coordinates)) {
                throw new Error('Invalid coordinates received from server');
            }

            return {
                location: data.location ? createGeoJSONFeature(data.location) : null,
                boundary: data.boundary ? createGeoJSONFeature(data.boundary) : null
            } as LocationData;
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ 
                queryKey: ['property', propertyId, 'location']
            });
        },
        retry: 1, // Retry failed updates once
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
            // Validate polygon coordinates before sending
            if (!validatePolygonCoordinates(coordinates)) {
                throw new Error('Invalid polygon coordinates. Each point must have valid longitude (-180 to 180) and latitude (-90 to 90) values.');
            }

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
            console.log('Boundary update response:', data);

            // Validate received boundary data
            if (data.boundary && !validatePolygonCoordinates(data.boundary.coordinates[0])) {
                throw new Error('Invalid boundary coordinates received from server');
            }

            return {
                location: data.location ? createGeoJSONFeature(data.location) : null,
                boundary: data.boundary ? createGeoJSONFeature(data.boundary) : null
            } as LocationData;
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ 
                queryKey: ['property', propertyId, 'location']
            });
        },
        retry: 1, // Retry failed updates once
    });
};
