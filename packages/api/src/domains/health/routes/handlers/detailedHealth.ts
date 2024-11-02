import { Request, Response } from 'express';
import { HealthService } from '../../services/healthService';
import { logger } from '../../../../core/utils/logger';

const healthService = new HealthService();

export async function detailedHealth(req: Request, res: Response) {
    try {
        logger.info('Detailed health check requested');
        
        const status = await healthService.getSystemStatus();
        
        const isHealthy = status.database && status.api;
        
        res.status(isHealthy ? 200 : 503).json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            checks: {
                database: {
                    status: status.database ? 'up' : 'down'
                },
                api: {
                    status: status.api ? 'up' : 'down'
                }
            },
            timestamp: status.timestamp
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
