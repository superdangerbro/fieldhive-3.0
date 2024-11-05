import { Address } from './address';
import { Property } from './property';
import { User } from './user';

export interface Account {
    account_id: string;
    name: string;
    type: string;
    status: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    billing_address_id?: string;
    billingAddress?: Address;
    properties?: Property[];
    users?: User[];
    created_at?: Date;
    updated_at?: Date;
}

export interface AccountStatus {
    value: string;
    label: string;
    color: string;
}

export interface AccountType {
    value: string;
    label: string;
    color: string;
}
