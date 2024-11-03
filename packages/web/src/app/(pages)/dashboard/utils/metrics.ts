import { Account } from '@/app/globaltypes';
import { calculateGrowthPercentage, getGrowthIndicator } from './formatters';

export const calculateAccountMetrics = (accounts: Account[]) => {
    const total = accounts.length;
    const active = accounts.filter(acc => acc.status === 'active').length;
    const inactive = accounts.filter(acc => acc.status === 'inactive').length;
    const suspended = accounts.filter(acc => acc.status === 'suspended').length;

    return {
        total,
        active,
        inactive,
        suspended,
        activePercentage: (active / total) * 100,
        inactivePercentage: (inactive / total) * 100,
        suspendedPercentage: (suspended / total) * 100
    };
};

export const calculateAccountGrowth = (
    accounts: Account[],
    currentPeriodDays: number = 30,
    previousPeriodDays: number = 60
) => {
    const now = new Date();
    const currentPeriodStart = new Date(now.getTime() - (currentPeriodDays * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(now.getTime() - (previousPeriodDays * 24 * 60 * 60 * 1000));

    const currentPeriodAccounts = accounts.filter(account => 
        new Date(account.created_at) >= currentPeriodStart
    ).length;

    const previousPeriodAccounts = accounts.filter(account =>
        new Date(account.created_at) >= previousPeriodStart &&
        new Date(account.created_at) < currentPeriodStart
    ).length;

    const growthRate = calculateGrowthPercentage(currentPeriodAccounts, previousPeriodAccounts);
    const trend = getGrowthIndicator(currentPeriodAccounts, previousPeriodAccounts);

    return {
        current: currentPeriodAccounts,
        previous: previousPeriodAccounts,
        growthRate,
        trend
    };
};

export const groupByState = (accounts: Account[]) => {
    return accounts.reduce((acc, account) => {
        if (account.billingAddress) {
            const state = account.billingAddress.province;
            if (!acc[state]) {
                acc[state] = [];
            }
            acc[state].push(account);
        }
        return acc;
    }, {} as Record<string, Account[]>);
};
