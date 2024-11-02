import { Address } from './entities/Address';

export interface CreateAddressDto {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

export interface AddressResponse extends Address {
    address_id: string;
    created_at: Date;
    updated_at: Date;
}

export interface AddressFilters {
    city?: string;
    province?: string;
    country?: string;
}
