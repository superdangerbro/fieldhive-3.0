'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ENV_CONFIG } from '../../../../config/environment';
import { 
    GeoJSONPoint, 
    GeoJSONPolygon, 
    LocationData,
    Coordinate,
    validateGeoJsonCoordinates
} from '../types/location';
import { handleApiError, buildApiRequest } from './utils';

const buildUrl = (endpoint: string) => `${ENV_CONFIG.api.baseUrl}${endpoint}`;

// Validate GeoJSON coordinates
function validateGeoJsonPoint(point: GeoJSONPoint | null): GeoJSONPoint | null {
    if (!point) return null;
    const [lng, lat] = point.coordinates;
    if (!validateGeoJsonCoordinates(lng, lat)) {
        console.error('Invalid GeoJSON point coordinates:', point.coordinates);
        return null;
    }
    return point;
}

function validateGeoJsonPolygon(polygon: GeoJSONPolygon | null): GeoJSONPolygon | null {
    if (!polygon) return null;
    
    // Check if all coordinates in the polygon are valid
    const allValid = polygon.coordinates[0].every(([lng, lat]) => 
        validateGeoJsonCoordinates(lng, lat)
    );
    
    if (!allValid) {
        console.error('Invalid GeoJSON polygon coordinates:', polygon.coordinates);
        return null;
    }
    
    return polygon;
}

// Get property location data
export const usePropertyLocation = (propertyId: string) => {
    return useQuery<LocationData, Error, LocationData>({
        queryKey: ['propertyLocation', propertyId],
        queryFn: async () => {
            const response = await fetch(
                buildUrl(`/properties/${propertyId}/location`),
                buildApiRequest()
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            const data = await response.json();
            
            // Validate coordinates and return null if invalid
            return {
                location: validateGeoJsonPoint(data.location),
                boundary: validateGeoJsonPolygon(data.boundary)
            };
        },
        enabled: !!propertyId,
        staleTime: 30000,
        gcTime: 60000,
        refetchOnWindowFocus: false
    });
};

// Update property location
export const useUpdatePropertyLocation = () => {
    const queryClient = useQueryClient();

    return useMutation<LocationData, Error, { propertyId: string; coordinates: Coordinate }>({
        mutationFn: async ({ propertyId, coordinates }) => {
            const [lng, lat] = coordinates;
            if (!validateGeoJsonCoordinates(lng, lat)) {
                throw new Error('Invalid coordinates: longitude must be between -180 and 180, latitude must be between -90 and 90');
            }

            const response = await fetch(
                buildUrl(`/properties/${propertyId}/location`),
                buildApiRequest({
                    method: 'PUT',
                    body: JSON.stringify({ coordinates })
                })
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ queryKey: ['propertyLocation', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        }
    });
};

// Update property boundary
export const useUpdatePropertyBoundary = () => {
    const queryClient = useQueryClient();

    return useMutation<LocationData, Error, { propertyId: string; coordinates: Array<[number, number]> | null }>({
        mutationFn: async ({ propertyId, coordinates }) => {
            // If coordinates is null, remove the boundary
            if (coordinates === null) {
                const response = await fetch(
                    buildUrl(`/properties/${propertyId}/boundary`),
                    buildApiRequest({
                        method: 'DELETE'
                    })
                );

                if (!response.ok) {
                    await handleApiError(response);
                }

                return response.json();
            }

            // Validate all coordinates in the boundary
            const allValid = coordinates.every(([lng, lat]) => 
                validateGeoJsonCoordinates(lng, lat)
            );

            if (!allValid) {
                throw new Error('Invalid coordinates: longitude must be between -180 and 180, latitude must be between -90 and 90');
            }

            const response = await fetch(
                buildUrl(`/properties/${propertyId}/boundary`),
                buildApiRequest({
                    method: 'PUT',
                    body: JSON.stringify({ coordinates })
                })
            );

            if (!response.ok) {
                await handleApiError(response);
            }

            return response.json();
        },
        onSuccess: (_, { propertyId }) => {
            queryClient.invalidateQueries({ queryKey: ['propertyLocation', propertyId] });
            queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
        }
    });
};
