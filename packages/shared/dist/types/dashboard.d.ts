import { ReactNode } from 'react';
export interface DashboardMetrics {
    accounts: {
        total: number;
        active: number;
        inactive: number;
        suspended: number;
        activePercentage: number;
        inactivePercentage: number;
        suspendedPercentage: number;
    };
    growth: {
        current: number;
        previous: number;
        growthRate: number;
        trend: 'increase' | 'decrease' | 'stable';
    };
}
export interface ActivityItem {
    id: string;
    type: 'account_created' | 'account_updated' | 'account_suspended' | 'account_activated';
    timestamp: string;
    accountId: string;
    accountName: string;
    details?: string;
}
export interface RegionalDistribution {
    state: string;
    count: number;
    percentage: number;
}
export interface TimeSeriesData {
    timestamp: string;
    value: number;
}
export interface DashboardData {
    metrics: DashboardMetrics;
    recentActivity: ActivityItem[];
    regionalDistribution: RegionalDistribution[];
    accountGrowth: TimeSeriesData[];
}
export type DateRangeFilter = '7d' | '30d' | '90d' | '1y' | 'all';
export interface DashboardFilters {
    dateRange: DateRangeFilter;
    status?: 'active' | 'inactive' | 'suspended' | 'all';
    region?: string;
}
export interface DashboardWidgetProps {
    title: string;
    tooltip?: string;
    loading?: boolean;
    error?: string;
    children: ReactNode;
    minHeight?: number | string;
}
export interface MetricCardProps {
    title: string;
    value: number | string;
    trend?: {
        value: number;
        direction: 'up' | 'down' | 'neutral';
    };
    icon?: ReactNode;
    tooltip?: string;
    loading?: boolean;
    error?: string;
}
export interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
    }[];
}
export interface ChartOptions {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
        legend?: {
            display?: boolean;
            position?: 'top' | 'bottom' | 'left' | 'right';
        };
        tooltip?: {
            enabled?: boolean;
        };
    };
    scales?: {
        x?: {
            grid?: {
                display?: boolean;
            };
        };
        y?: {
            grid?: {
                display?: boolean;
            };
            beginAtZero?: boolean;
        };
    };
}
export interface ChartWidgetProps extends DashboardWidgetProps {
    data: ChartData;
    options?: ChartOptions;
    type: 'line' | 'bar' | 'pie' | 'doughnut';
    height?: number;
}
