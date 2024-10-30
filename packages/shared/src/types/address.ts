export interface Address {
    address_id: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateAddressDto {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export interface UpdateAddressDto {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
}
