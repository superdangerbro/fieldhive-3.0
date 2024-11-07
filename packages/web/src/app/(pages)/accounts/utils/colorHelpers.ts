'use client';

import type { AccountType, AccountStatus } from '@/app/globalTypes/account';

export function getTypeColor(type: string, types: AccountType[]): string | undefined {
    if (!type || !types?.length) return undefined;
    const typeConfig = types.find(t => t.value === type);
    return typeConfig?.color;
}

export function getStatusColor(status: string, statuses: AccountStatus[]): string | undefined {
    if (!status || !statuses?.length) return undefined;
    const statusConfig = statuses.find(s => s.value === status);
    return statusConfig?.color;
}
