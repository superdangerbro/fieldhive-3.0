import { Property } from './entities/Property';
import { Address } from '../addresses';
import { Account } from '../accounts/entities/Account';

export type PropertyType = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type PropertyStatus = 'Active' | 'Inactive' | 'Archived' | 'Pending';

export interface CreatePropertyDto {
    name: string;
    type: PropertyType;
    service_address_id?: string;
    status?: PropertyStatus;
    account_ids?: string[];
}

export interface UpdatePropertyDto {
    name?: string;
    type?: PropertyType;
    status?: PropertyStatus;
    service_address_id?: string;
}

export interface PropertyResponse {
    id: string;
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    service_address_id: string | null;
    serviceAddress: Address | null;
    accounts: Account[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyFilters {
    type?: PropertyType;
    status?: PropertyStatus;
    name?: string;
    account_id?: string;
}

// For eager loading relationships
export interface PropertyWithRelations extends Property {
    serviceAddress: Address | null;
    accounts: Account[];
}
