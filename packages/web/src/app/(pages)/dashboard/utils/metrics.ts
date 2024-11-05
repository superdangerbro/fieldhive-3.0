import { Account } from '@/app/globalTypes/account';
import { calculateGrowthPercentage, getGrowthIndicator } from './formatters';

interface AccountMetrics {
    total: number;
    active: number;
    inactive: number;
    growth: number;
    growthIndicator: 'stable' | 'increase' | 'decrease';
}

export function calculateAccountMetrics(accounts: Account[]): AccountMetrics {
    const total = accounts.length;
    const active = accounts.filter(account => account.status === 'Active').length;
    const inactive = total - active;

    // Calculate month-over-month growth
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const newAccounts = accounts.filter(account => {
        const createdAt = account.created_at ? new Date(account.created_at) : null;
        return createdAt && createdAt >= lastMonth;
    }).length;

    const previousTotal = total - newAccounts;
    const growth = calculateGrowthPercentage(total, previousTotal);
    const growthIndicator = getGrowthIndicator(total, previousTotal);

    return {
        total,
        active,
        inactive,
        growth,
        growthIndicator
    };
}
