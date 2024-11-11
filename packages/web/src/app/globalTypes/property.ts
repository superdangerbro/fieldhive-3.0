import type { Address } from './address';
import type { Account } from './account';

export interface PropertyType {
    value: string;
    label: string;
}

export interface PropertyStatus {
    value: string;
    label: string;
    color: string;
}

export interface Property {
    property_id: string;
    name: string;
    type: string;
    status: string;
    service_address_id: string | null;
    billing_address_id: string | null;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    boundary?: {
        type: 'Polygon';
        coordinates: [number, number][][];
    };
    serviceAddress?: Address | null;
    billingAddress?: Address | null;
    accounts?: Account[];
    created_at: Date;
    updated_at: Date;
}

export interface CreatePropertyDto {
    name: string;
    type: string;
    status: string;
    service_address_id: string; // Required
    billing_address_id: string; // Required
    account_id: string; // Required
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    boundary?: {
        type: 'Polygon';
        coordinates: [number, number][][];
    };
}

export interface UpdatePropertyDto {
    name?: string;
    type?: string;
    status?: string;
    service_address_id?: string;
    billing_address_id?: string;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    boundary?: {
        type: 'Polygon';
        coordinates: [number, number][][];
    };
    account_ids?: string[]; // Plural for update
}
