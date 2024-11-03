import { Account } from '@/app/globaltypes';

export const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
};

export const getRecentActivity = (accounts: Account[], days: number = 30) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return accounts
        .filter(account => {
            const updatedAt = new Date(account.updated_at);
            return updatedAt >= dateThreshold;
        })
        .sort((a, b) => {
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
};
