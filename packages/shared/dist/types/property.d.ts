import { Address } from './address';
export type PropertyType = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural';
export type PropertyStatus = 'Active' | 'Inactive' | 'Archived';
export interface Job {
    job_id: string;
    job_type_id: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}
export interface Property {
    property_id: string;
    name: string;
    type: PropertyType;
    status: PropertyStatus;
    billing_address?: Address;
    service_address?: Address;
    jobs?: Job[];
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