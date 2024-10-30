import { Address } from './address';
import { BaseModel } from './index';
import { Property } from './property';

export type AccountType = 'Customer' | 'Vendor' | 'Partner' | 'Individual' | 'Company' | 'Property Manager';
export type AccountStatus = 'Active' | 'Inactive' | 'Archived';

export interface Account extends BaseModel {
    name: string;
    type: AccountType;
    status: AccountStatus;
    billing_address?: Address;
    account_id: string;
    created_at: string;
    updated_at: string;
    properties?: Property[];
}

export interface CreateAccountDto {
    name: string;
    type: AccountType;
    billing_address?: Address;
}

export interface UpdateAccountDto {
    name?: string;
    type?: AccountType;
    status?: AccountStatus;
    billing_address?: Address;
}

export interface AccountsResponse {
    accounts: Account[];
    total: number;
    limit: number;
    offset: number;
}
