import type { CreateAddressDto } from '@/app/globalTypes/address';
import type { User } from '@/app/globalTypes';

export interface CreateAccountDto {
    name: string;
    type: string;
    status?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    billing_address_id?: string;
    billingAddress?: CreateAddressDto;
    users?: User[];
    property_ids?: string[];
}
