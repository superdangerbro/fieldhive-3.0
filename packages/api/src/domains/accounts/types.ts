import { Account } from './entities/Account';
import { Address } from '../addresses';

export type AccountType = 'Individual' | 'Company' | 'Property Manager';
export type AccountStatus = 'Active' | 'Inactive' | 'Archived';

export interface CreateAccountDto {
    name: string;
    type: AccountType;
    billing_address_id?: string;
    status?: AccountStatus;
}

export interface UpdateAccountDto {
    name?: string;
    type?: AccountType;
    status?: AccountStatus;
    billing_address_id?: string;
}

export interface AccountResponse extends Omit<Account, 'billingAddress'> {
    account_id: string;
    billing_address?: Address;
    created_at: Date;
    updated_at: Date;
}

export interface AccountFilters {
    type?: AccountType;
    status?: AccountStatus;
    name?: string;
}

export interface AccountWithRelations extends Account {
    billing_address?: Address;
}
