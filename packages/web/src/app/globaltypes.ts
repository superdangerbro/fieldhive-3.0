// Settings Types
export interface Setting {
    id: string;
    key: string;
    value: any;
    created_at: Date;
    updated_at: Date;
}

// User Types
export interface User {
    user_id: string;
    username: string;
    email: string;
    phone: string;
    is_contact: boolean;
    first_name: string;
    last_name: string;
    created_at?: Date;
    updated_at?: Date;
}

// Account Types
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
    properties?: any[]; // TODO: Define Property type when needed
    jobs?: any[]; // TODO: Define Job type when needed
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

// Address Types
export interface Address {
    address_id: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
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
    country: string;
    label?: string;
}

// Equipment Types
export interface EquipmentStatus {
    value: string;
    label: string;
    color: string;
}

export interface EquipmentType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

// Job Types
export interface JobStatus {
    value: string;
    label: string;
    color: string;
}

export interface JobType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

// Property Types
export interface PropertyStatus {
    value: string;
    label: string;
    color: string;
}

export interface PropertyType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

// DTOs
export interface CreateSettingDto {
    key: string;
    value: any;
}

export interface UpdateSettingDto {
    key?: string;
    value?: any;
}

// Response Types
export interface SettingResponse {
    id: string;
    key: string;
    value: any;
    created_at: Date;
    updated_at: Date;
}

export interface SettingFilters {
    key?: string;
}
