import { Point, Polygon } from 'geojson';
import { AccountRole } from './account';

export enum PropertyStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ARCHIVED = 'archived'
}

export enum PropertyType {
    RESIDENTIAL = 'residential',
    COMMERCIAL = 'commercial',
    INDUSTRIAL = 'industrial',
    AGRICULTURAL = 'agricultural',
    MIXED_USE = 'mixed_use'
}

export interface PropertyAccount {
    accountId: string;
    name: string;
    role: AccountRole;
}

export interface Property {
    id: string;
    name: string;
    address: string;
    location: Point;
    boundary?: Polygon;
    type: PropertyType;
    status: PropertyStatus;
    accounts: PropertyAccount[];
    createdAt: string;
    updatedAt: string;
}

// API Request Types
export interface CreatePropertyRequest {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country?: string;
    location: Point;
    boundary?: Polygon;
    type: PropertyType;
    accountConnections: {
        accountId: string;
        role: AccountRole;
    }[];
}

export interface UpdatePropertyRequest {
    name?: string;
    address?: string;
    location?: Point;
    boundary?: Polygon;
    type?: PropertyType;
    status?: PropertyStatus;
}

// API Response Types
export interface PropertyResponse extends Property {}

export interface PropertiesResponse {
    properties: Property[];
    total: number;
    page: number;
    pageSize: number;
}

// Search Parameters
export interface PropertySearchParams {
    query?: string;
    accountId?: string;
    type?: PropertyType;
    status?: PropertyStatus;
    bounds?: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    page?: number;
    limit?: number;
    sortBy?: keyof Property;
    sortOrder?: 'asc' | 'desc';
}
