import { Router } from 'express';
import { ActivityItem } from '@fieldhive/shared';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

interface AccountRecord {
    id: string;
    account_name: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at: string;
    updated_at: string;
}

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
