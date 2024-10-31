import { Property, CreatePropertyDto, UpdatePropertyDto, PropertiesResponse, Account, CreateAccountDto, UpdateAccountDto, AccountsResponse, Job, JobsResponse, UpdateJobDto, CreateJobDto, Address, CreateAddressDto, UpdateAddressDto } from '@fieldhive/shared';

export const API_ENDPOINTS = {
    PROPERTIES: '/properties',
    ACCOUNTS: '/accounts',
    JOBS: '/jobs',
    SETTINGS: '/settings',
    EQUIPMENT: '/equipment',
    ADDRESSES: '/addresses'
};

class Api {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Address methods
    async getAddress(id: string): Promise<Address> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ADDRESSES}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch address');
        }
        return response.json();
    }

    async createAddress(address: CreateAddressDto): Promise<Address> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ADDRESSES}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(address),
        });
        if (!response.ok) {
            throw new Error('Failed to create address');
        }
        return response.json();
    }

    async updateAddress(id: string, address: UpdateAddressDto): Promise<Address> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ADDRESSES}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(address),
        });
        if (!response.ok) {
            throw new Error('Failed to update address');
        }
        return response.json();
    }

    // Settings methods
    async getSetting(key: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SETTINGS}/${key}`);
        if (!response.ok) {
            if (response.status === 404) {
                // Return default values for known settings
                switch (key) {
                    case 'property_statuses':
                        return ['Active', 'Inactive', 'Archived', 'Pending'];
                    default:
                        throw new Error(`Failed to fetch setting: ${key}`);
                }
            }
            throw new Error(`Failed to fetch setting: ${key}`);
        }
        return response.json();
    }

    async updateSetting(key: string, value: any): Promise<any> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SETTINGS}/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ value }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update setting: ${key}`);
        }
        return response.json();
    }

    // Property methods
    async getProperties(params?: { search?: string; limit?: number; offset?: number; accountId?: string }): Promise<PropertiesResponse> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.offset) searchParams.append('offset', params.offset.toString());
        if (params?.accountId) searchParams.append('accountId', params.accountId);

        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES}?${searchParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch properties');
        }
        return response.json();
    }

    async createProperty(property: CreatePropertyDto): Promise<Property> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES}/${id}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES}/${id}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.PROPERTIES}/${id}/archive`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to archive property');
        }
        
        return response.json();
    }

    // Account methods
    async getAccounts(params?: { search?: string; limit?: number; offset?: number }): Promise<AccountsResponse> {
        const searchParams = new URLSearchParams();
        if (params?.search) searchParams.append('search', params.search);
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.offset) searchParams.append('offset', params.offset.toString());

        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ACCOUNTS}?${searchParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch accounts');
        }
        return response.json();
    }

    async createAccount(account: CreateAccountDto): Promise<Account> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ACCOUNTS}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ACCOUNTS}/${id}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ACCOUNTS}/${id}`, {
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
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.ACCOUNTS}/${id}/archive`, {
            method: 'POST',
        });
        
        if (!response.ok) {
            throw new Error('Failed to archive account');
        }
        
        return response.json();
    }

    // Job methods
    async getJobs(page: number, pageSize: number): Promise<JobsResponse> {
        const searchParams = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.JOBS}?${searchParams}`);
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        return response.json();
    }

    async getJobTypes(): Promise<{ jobTypes: { id: string; name: string }[] }> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SETTINGS}/job_types`);
        if (!response.ok) {
            throw new Error('Failed to fetch job types');
        }
        return response.json();
    }

    async createJob(data: CreateJobDto): Promise<Job> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.JOBS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                property_id: data.propertyId,
                job_type_id: data.jobTypeId
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to create job');
        }
        return response.json();
    }

    async updateJob(id: string, data: UpdateJobDto): Promise<Job> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.JOBS}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error('Failed to update job');
        }
        return response.json();
    }

    async deleteJob(id: string): Promise<{ success: boolean }> {
        const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.JOBS}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete job');
        }
        return response.json();
    }

    // Equipment settings methods
    async getEquipmentTypes(): Promise<any> {
        return this.getSetting('equipment_types');
    }

    async saveEquipmentTypes(types: any): Promise<any> {
        return this.updateSetting('equipment_types', types);
    }

    async getEquipmentStatuses(): Promise<any> {
        return this.getSetting('equipment_statuses');
    }

    async saveEquipmentStatuses(statuses: any): Promise<any> {
        return this.updateSetting('equipment_statuses', statuses);
    }
}

export const api = new Api();

// Export bound methods for direct use
export const getAddress = api.getAddress.bind(api);
export const createAddress = api.createAddress.bind(api);
export const updateAddress = api.updateAddress.bind(api);
export const getAccounts = api.getAccounts.bind(api);
export const createAccount = api.createAccount.bind(api);
export const updateAccount = api.updateAccount.bind(api);
export const deleteAccount = api.deleteAccount.bind(api);
export const archiveAccount = api.archiveAccount.bind(api);
export const getProperties = api.getProperties.bind(api);
export const createProperty = api.createProperty.bind(api);
export const updateProperty = api.updateProperty.bind(api);
export const deleteProperty = api.deleteProperty.bind(api);
export const archiveProperty = api.archiveProperty.bind(api);
export const getJobs = api.getJobs.bind(api);
export const getJobTypes = api.getJobTypes.bind(api);
export const createJob = api.createJob.bind(api);
export const updateJob = api.updateJob.bind(api);
export const deleteJob = api.deleteJob.bind(api);
export const getSetting = api.getSetting.bind(api);
export const updateSetting = api.updateSetting.bind(api);
export const getEquipmentTypes = api.getEquipmentTypes.bind(api);
export const saveEquipmentTypes = api.saveEquipmentTypes.bind(api);
export const getEquipmentStatuses = api.getEquipmentStatuses.bind(api);
export const saveEquipmentStatuses = api.saveEquipmentStatuses.bind(api);

// Export useApi hook
export const useApi = () => api;
