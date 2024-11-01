import { 
    Account, 
    AccountType, 
    AccountStatus, 
    CreateAccountDto, 
    UpdateAccountDto, 
    AccountsResponse 
} from '@fieldhive/shared';

// Re-export shared types
export { 
    AccountType, 
    AccountStatus, 
    CreateAccountDto, 
    UpdateAccountDto, 
    AccountsResponse 
};

// Extend shared types for internal use
export interface AccountResponse extends Omit<Account, 'properties'> {
    properties?: Array<{
        property_id: string;
        name: string;
        role?: string;
    }>;
}

// Validation constants
export const VALID_TYPES: AccountType[] = [
    'Customer',
    'Vendor',
    'Partner',
    'Individual',
    'Company',
    'Property Manager'
];

export const VALID_STATUSES: AccountStatus[] = [
    'Active',
    'Inactive',
    'Archived'
];

/**
 * Example Usage:
 * ```typescript
 * // Using shared types
 * const account: Account = { ... };
 * 
 * // Using internal types
 * const response: AccountResponse = { ... };
 * 
 * // Using DTOs
 * const createRequest: CreateAccountDto = { ... };
 * const updateRequest: UpdateAccountDto = { ... };
 * ```
 */
