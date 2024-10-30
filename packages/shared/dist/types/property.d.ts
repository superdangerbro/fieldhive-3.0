import { Address } from './address';
import { BaseModel } from './index';
export type PropertyType = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type PropertyStatus = 'Active' | 'Inactive' | 'Archived';
export interface Property extends BaseModel {
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    billing_address?: Address;
    service_address?: Address;
    created_at: string;
    updated_at: string;
}
export interface CreatePropertyDto {
    name: string;
    type: PropertyType;
    billing_address?: Address;
    service_address?: Address;
}
export interface UpdatePropertyDto {
    name?: string;
    type?: PropertyType;
    status?: PropertyStatus;
    billing_address?: Address;
    service_address?: Address;
}
export interface PropertiesResponse {
    properties: Property[];
    total: number;
    limit: number;
    offset: number;
}
//# sourceMappingURL=property.d.ts.map