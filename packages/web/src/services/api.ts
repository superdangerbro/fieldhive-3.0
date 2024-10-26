import { CreateAccountDto, AccountResponse, AccountsResponse } from '@fieldhive/shared';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createAccount(data: CreateAccountDto): Promise<AccountResponse> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create account');
    }

    return response.json();
}

export async function getAccounts(page: number = 1, pageSize: number = 10): Promise<AccountsResponse> {
    const response = await fetch(
        `${API_BASE_URL}/accounts?page=${page}&pageSize=${pageSize}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch accounts');
    }

    return response.json();
}

export async function getAccount(id: string): Promise<AccountResponse> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch account');
    }

    return response.json();
}

export async function updateAccount(id: string, data: Partial<CreateAccountDto>): Promise<AccountResponse> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update account');
    }

    return response.json();
}

export async function deleteAccount(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
    }
}
