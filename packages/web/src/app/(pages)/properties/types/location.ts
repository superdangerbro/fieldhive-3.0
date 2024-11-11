export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number];  // [lng, lat]
}

export interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: [number, number][][];  // [[lng, lat], ...]
}

export type GeoJSONPolygonOrNull = GeoJSONPolygon | null;

export interface LocationData {
    location: GeoJSONPoint | null;
    boundary: GeoJSONPolygon | null;
}

export type Coordinate = [number, number];

// Helper function to validate coordinates
export function validateCoordinates(coords: unknown): coords is Coordinate {
    if (!Array.isArray(coords) || coords.length !== 2) {
        console.warn('Invalid coordinates array:', coords);
        return false;
    }
    const [lng, lat] = coords;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.warn('Invalid coordinate values:', { lng, lat });
        return false;
    }
    return validateGeoJsonCoordinates(lng, lat);
}

// Helper function to convert array to tuple
export function asTuple<T extends any[]>(arr: T): Coordinate {
    if (!arr || !Array.isArray(arr) || arr.length < 2) {
        console.warn('Invalid coordinates array:', arr);
        return DEFAULT_LOCATION;
    }
    const [first, second] = arr;
    if (typeof first !== 'number' || typeof second !== 'number') {
        console.warn('Invalid coordinate values:', { first, second });
        return DEFAULT_LOCATION;
    }
    return [first, second];
}

// Helper function to format coordinates for display
export function formatCoordinates(coords: Coordinate | undefined | null): string {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) {
        console.warn('Invalid coordinates:', coords);
        return 'Not set';
    }

    try {
        const [longitude, latitude] = coords;
        if (!validateGeoJsonCoordinates(longitude, latitude)) {
            console.warn('Invalid coordinate values:', { longitude, latitude });
            return 'Invalid format';
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
        console.error('Error formatting coordinates:', error);
        return 'Invalid format';
    }
}

// Default location from environment variables
export const DEFAULT_LOCATION: Coordinate = [
    Number(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE) || 49.2827,
    Number(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE) || -123.1207
];

export const DEFAULT_ZOOM = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 12;

export const APP_THEME_COLOR = '#6366f1';

// Helper function to compare coordinates
export function areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

// Helper function to validate coordinates in display format [lat, lng]
export function validateLatLng(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Helper function to validate coordinates in GeoJSON format [lng, lat]
export function validateGeoJsonCoordinates(lng: number, lat: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Helper function to safely convert GeoJSON coordinates to display coordinates
export function safeGeoJsonToDisplay(coord: [number, number]): [number, number] | null {
    try {
        const [lng, lat] = coord;
        if (validateGeoJsonCoordinates(lng, lat)) {
            return [lat, lng];  // Return as [latitude, longitude]
        }
        return null;
    } catch (err) {
        console.error('Error converting coordinates:', err);
        return null;
    }
}

// Helper function to convert display coordinates to GeoJSON coordinates
export function displayToGeoJson(coords: [number, number]): [number, number] {
    const [lat, lng] = coords;
    if (!validateLatLng(lat, lng)) {
        throw new Error('Invalid coordinates: latitude must be between -90 and 90, longitude must be between -180 and 180');
    }
    return [lng, lat];  // Convert [lat, lng] to [lng, lat]
}
