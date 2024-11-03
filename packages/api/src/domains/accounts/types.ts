export interface CreateAccountDto {
    name: string;
    type: string;
    status?: string;
    billing_address_id?: string;
    data?: Record<string, any>;
}

export interface UpdateAccountDto {
    name?: string;
    type?: string;
    status?: string;
    billing_address_id?: string;
    data?: Record<string, any>;
}

export interface AccountFilters {
    type?: string;
    status?: string;
    name?: string;
}
