import { Property, CreatePropertyDto, UpdatePropertyDto, PropertiesResponse, PropertySearchParams, Account, CreateAccountDto, UpdateAccountDto, AccountsResponse } from '@fieldhive/shared';

class Api {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Account methods
    async getAccounts(params?: { search?: string; limit?: number; offset?: number }): Promise<AccountsResponse> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.offset) searchParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/accounts?${searchParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }
        return response.json();
    }

    async createAccount(account: CreateAccountDto): Promise<Account> {
        const response = await fetch(`${this.baseUrl}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(account),
        });
        if (!response.ok) {
            throw new Error('Failed to create account');
        }
        return response.json();
    }

    async updateAccount(id: string, account: UpdateAccountDto): Promise<Account> {
        const response = await fetch(`${this.baseUrl}/accounts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(account),
        });
        if (!response.ok) {
            throw new Error('Failed to update account');
        }
        return response.json();
    }

    async deleteAccount(id: string): Promise<{ success: boolean; error?: string; canArchive?: boolean }> {
        const response = await fetch(`${this.baseUrl}/accounts/${id}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                message: data.message || 'Failed to delete account',
                canArchive: data.canArchive
            };
        }
        
        return data;
    }

    async archiveAccount(id: string): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/accounts/${id}/archive`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to archive account');
        }
        
        return response.json();
    }

    // Property methods
    async getProperties(params?: { search?: string; limit?: number; offset?: number }): Promise<PropertiesResponse> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.offset) searchParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}/properties?${searchParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        return response.json();
    }

    async createProperty(property: CreatePropertyDto): Promise<Property> {
        const response = await fetch(`${this.baseUrl}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(property),
        });
        if (!response.ok) {
            throw new Error('Failed to create property');
        }
        return response.json();
    }

    async updateProperty(id: string, property: UpdatePropertyDto): Promise<Property> {
        const response = await fetch(`${this.baseUrl}/properties/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(property),
        });
        if (!response.ok) {
            throw new Error('Failed to update property');
        }
        return response.json();
    }

    async deleteProperty(id: string): Promise<{ success: boolean; error?: string; canArchive?: boolean }> {
        const response = await fetch(`${this.baseUrl}/properties/${id}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                message: data.message || 'Failed to delete property',
                canArchive: data.canArchive
            };
        }
        
        return data;
    }

    async archiveProperty(id: string): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}/properties/${id}/archive`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to archive property');
        }
        
        return response.json();
    }
}

export const api = new Api();

// Export bound methods for direct use
export const getAccounts = api.getAccounts.bind(api);
export const createAccount = api.createAccount.bind(api);
export const updateAccount = api.updateAccount.bind(api);
export const deleteAccount = api.deleteAccount.bind(api);
export const archiveAccount = api.archiveAccount.bind(api);
export const getProperties = api.getProperties.bind(api);
export const createProperty = api.createProperty.bind(api);
export const updateProperty = api.updateProperty.bind(api);
export const deleteProperty = api.deleteProperty.bind(api);
