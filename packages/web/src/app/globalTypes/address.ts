export interface Address {
    address_id: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country?: string;
    label?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateAddressDto {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country?: string;
    label?: string;
}
