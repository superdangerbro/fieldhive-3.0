import { ApiClient, API_ENDPOINTS } from '../client';
import type { 
    Account, 
    CreateAccountDto, 
    UpdateAccountDto, 
    AccountsResponse 
} from '@fieldhive/shared';

export class AccountsApi extends ApiClient {
    async getAccounts(params?: { 
        search?: string; 
        limit?: number; 
        offset?: number 
    }): Promise<AccountsResponse> {
        return this.get(API_ENDPOINTS.ACCOUNTS, params as Record<string, string>);
    }

    async createAccount(account: CreateAccountDto): Promise<Account> {
        return this.post(API_ENDPOINTS.ACCOUNTS, account);
    }

    async updateAccount(id: string, account: UpdateAccountDto): Promise<Account> {
        return this.put(`${API_ENDPOINTS.ACCOUNTS}/${id}`, account);
    }

    async deleteAccount(id: string): Promise<{ success: boolean; error?: string; canArchive?: boolean }> {
        return this.delete(`${API_ENDPOINTS.ACCOUNTS}/${id}`);
    }

    async archiveAccount(id: string): Promise<{ success: boolean }> {
        return this.post(`${API_ENDPOINTS.ACCOUNTS}/${id}/archive`);
    }
}
