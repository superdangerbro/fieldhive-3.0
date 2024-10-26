import { Account } from '../services/mockData';

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

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
};

export const getGrowthIndicator = (current: number, previous: number) => {
    if (current === previous) return 'stable';
    return current > previous ? 'increase' : 'decrease';
};

export const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
};

export const groupByState = (accounts: Account[]) => {
    return accounts.reduce((acc, account) => {
        const state = account.billingAddress.state;
        if (!acc[state]) {
            acc[state] = [];
        }
        acc[state].push(account);
        return acc;
    }, {} as Record<string, Account[]>);
};

export const getRecentActivity = (accounts: Account[], days: number = 30) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return accounts.filter(account => {
        const updatedAt = new Date(account.updatedAt);
        return updatedAt >= dateThreshold;
    }).sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
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
        new Date(account.createdAt) >= currentPeriodStart
    ).length;

    const previousPeriodAccounts = accounts.filter(account =>
        new Date(account.createdAt) >= previousPeriodStart &&
        new Date(account.createdAt) < currentPeriodStart
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
