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
