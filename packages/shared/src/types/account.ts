import { Address } from './address';
import { Property } from './property';

export interface Account {
    account_id: string;
    name: string;
    type: string;
    status: string;
    billing_address?: Address;
    properties?: Property[];
    created_at: string;
    updated_at: string;
}

export interface CreateAccountDto {
    name: string;
    type: string;
    status?: string;
    address?: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
}

export interface UpdateAccountDto {
    name?: string;
    type?: string;
    status?: string;
    address?: {
        address1: string;
        address2?: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
    };
}

export interface AccountsResponse {
    accounts: Account[];
    total: number;
}
