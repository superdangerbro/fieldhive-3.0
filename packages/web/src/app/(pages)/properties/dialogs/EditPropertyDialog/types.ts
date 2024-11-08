'use client';

import type { Account } from '@/app/globalTypes/account';

export interface CreateAddressDto {
    address1: string;
    address2: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export interface PropertyFormData {
    name: string;
    billing_address: CreateAddressDto;
    service_address: CreateAddressDto;
    accounts: Account[];
}

export const emptyAddress: CreateAddressDto = {
    address1: '',
    address2: '',
    city: '',
    province: '',
    postal_code: '',
    country: 'Canada'
};

export const initialFormData: PropertyFormData = {
    name: '',
    billing_address: { ...emptyAddress },
    service_address: { ...emptyAddress },
    accounts: []
};
