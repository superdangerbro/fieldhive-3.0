import { Router } from 'express';
import { DashboardMetrics, ActivityItem } from '@fieldhive/shared';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

interface AccountRecord {
    id: string;
    account_name: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
    updated_at: string;
}

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
    try {
        // Get account metrics
        const accountMetrics = await AppDataSource.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
                COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended
            FROM account
        `);

        // Calculate percentages
        const total = parseInt(accountMetrics[0].total);
        const active = parseInt(accountMetrics[0].active);
        const inactive = parseInt(accountMetrics[0].inactive);
        const suspended = parseInt(accountMetrics[0].suspended);

        const metrics: DashboardMetrics = {
            accounts: {
                total,
                active,
                inactive,
                suspended,
                activePercentage: (active / total) * 100,
                inactivePercentage: (inactive / total) * 100,
                suspendedPercentage: (suspended / total) * 100
            },
            growth: {
                current: active,
                previous: active - 5, // Example: assuming 5 new active accounts
                growthRate: ((active - (active - 5)) / (active - 5)) * 100,
                trend: 'increase'
            }
        };

        res.json(metrics);
    } catch (error) {
        logger.error('Error fetching dashboard metrics:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch dashboard metrics'
        });
    }
});

// Get recent activity
router.get('/activity', async (req, res) => {
    try {
        const recentActivity = await AppDataSource.query(`
            SELECT 
                a.id,
                a.name as account_name,
                a.status,
                a.created_at,
                a.updated_at
            FROM account a
            ORDER BY a.updated_at DESC
            LIMIT 10
        `);

        const activity: ActivityItem[] = recentActivity.map((item: AccountRecord) => ({
            id: item.id,
            type: determineActivityType(item),
            timestamp: item.updated_at,
            accountId: item.id,
            accountName: item.account_name,
            details: getActivityDetails(item)
        }));

        res.json(activity);
    } catch (error) {
        logger.error('Error fetching recent activity:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch recent activity'
        });
    }
});

// Helper functions
function determineActivityType(item: AccountRecord): ActivityItem['type'] {
    if (new Date(item.created_at).getTime() === new Date(item.updated_at).getTime()) {
        return 'account_created';
    }
    if (item.status === 'suspended') {
        return 'account_suspended';
    }
    if (item.status === 'active') {
        return 'account_activated';
    }
    return 'account_updated';
}

function getActivityDetails(item: AccountRecord): string {
    switch (determineActivityType(item)) {
        case 'account_created':
            return `Account ${item.account_name} was created`;
        case 'account_suspended':
            return `Account ${item.account_name} was suspended`;
        case 'account_activated':
            return `Account ${item.account_name} was activated`;
        default:
            return `Account ${item.account_name} was updated`;
    }
}

export default router;
