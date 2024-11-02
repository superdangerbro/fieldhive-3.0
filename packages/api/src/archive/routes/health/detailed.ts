import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Detailed health check
router.get('/detailed', async (req, res) => {
    try {
        // Check database connection
        const dbStatus = await checkDatabaseConnection();

        // Get system info
        const systemInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        };

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            system: systemInfo
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Service unavailable'
        });
    }
});

async function checkDatabaseConnection() {
    try {
        const result = await AppDataSource.query('SELECT NOW()');
        return {
            status: 'connected',
            timestamp: result[0].now
        };
    } catch (error) {
        logger.error('Database health check failed:', error);
        return {
            status: 'error',
            error: 'Database connection failed'
        };
    }
}

export default router;
