// Base model for all database entities
export interface BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// Geospatial Types
export interface GeoPoint {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoPolygon {
    type: 'Polygon';
    coordinates: number[][][]; // Array of linear rings
}

// API Response Type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
