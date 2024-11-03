import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

// Basic health check
export async function basicHealth(req: Request, res: Response) {
    try {
        logger.info('Basic health check requested');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error in basic health check:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
}

// Detailed health check
export async function detailedHealth(req: Request, res: Response) {
    try {
        logger.info('Detailed health check requested');
        
        // Check database
        let dbStatus = false;
        try {
            await AppDataSource.query('SELECT 1');
            dbStatus = true;
        } catch (error) {
            logger.error('Database health check failed:', error);
        }

        const isHealthy = dbStatus;
        const timestamp = new Date().toISOString();
        
        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            checks: {
                database: {
                    status: dbStatus ? 'up' : 'down'
                },
                api: {
                    status: 'up' // API is running if we can execute this
                }
            },
            timestamp
        });
    } catch (error) {
        logger.error('Error in detailed health check:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
}
