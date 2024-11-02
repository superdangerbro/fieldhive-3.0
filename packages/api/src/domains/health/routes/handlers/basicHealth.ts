import { Request, Response } from 'express';
import { logger } from '../../../../core/utils/logger';

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
