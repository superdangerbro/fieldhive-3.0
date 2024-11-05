import { Account } from '@/app/globalTypes/account';

export function getAccountsByDateRange(accounts: Account[], startDate: Date, endDate: Date): Account[] {
    return accounts.filter(account => {
        const createdAt = account.created_at ? new Date(account.created_at) : null;
        return createdAt && createdAt >= startDate && createdAt <= endDate;
    });
}

export function getLastMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate, endDate };
}

export function getCurrentMonthRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startDate, endDate };
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}
