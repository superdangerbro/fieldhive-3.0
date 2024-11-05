import { Address } from './address';
import { Account } from './account';

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
    account_id?: string;
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
}
