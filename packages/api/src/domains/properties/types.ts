export interface CreatePropertyDto {
    name: string;
    type: string;
    status?: string;
    location?: any;
    boundary?: any;
    service_address_id?: string;
    billing_address_id?: string;
}

export interface UpdatePropertyDto {
    name?: string;
    type?: string;
    status?: string;
    location?: any;
    boundary?: any;
    service_address_id?: string;
    billing_address_id?: string;
}

export interface PropertyFilters {
    type?: string;
    status?: string;
    name?: string;
    account_id?: string;
}
