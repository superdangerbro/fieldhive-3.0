import { BaseModel } from './index';
import { Address, CreateAddressDto } from './address';
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'other';
export type PropertyStatus = 'active' | 'inactive' | 'archived' | 'pending';
export interface Property extends BaseModel {
    property_id: string;
    updated_at: string;
    created_at: string;
    name: string;
    property_type: PropertyType;
    location: {
        type: string;
        coordinates: [number, number];
    };
    boundary?: {
        type: string;
        coordinates: [number, number][][];
    };
    billing_address_id?: string;
    billing_address?: Address;
    service_address_id?: string;
    service_address?: Address;
    status: PropertyStatus;
    accounts?: Array<{
        account_id: string;
        name: string;
        role?: string;
    }>;
}
export interface CreatePropertyDto {
    name: string;
    property_type: PropertyType;
    location: {
        type: string;
        coordinates: [number, number];
    };
    boundary?: {
        type: string;
        coordinates: [number, number][][];
    };
    billing_address?: CreateAddressDto;
    service_address?: CreateAddressDto;
    status?: PropertyStatus;
    account_id: string;
}
export interface UpdatePropertyDto {
    name?: string;
    property_type?: PropertyType;
    location?: {
        type: string;
        coordinates: [number, number];
    };
    boundary?: {
        type: string;
        coordinates: [number, number][][];
    };
    billing_address?: CreateAddressDto;
    service_address?: CreateAddressDto;
    status?: PropertyStatus;
    accounts?: Array<{
        account_id: string;
        role?: string;
    }>;
}
export interface PropertiesResponse {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
}
//# sourceMappingURL=property.d.ts.map