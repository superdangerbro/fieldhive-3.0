import { Router } from 'express';
import { DashboardMetrics } from '@fieldhive/shared';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

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

export default router;
