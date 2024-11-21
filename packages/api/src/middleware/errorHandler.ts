import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    logger.error('Error handler caught:', {
        error: err,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        error: 'Internal server error',
        message: err.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
}

// Add request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    logger.info('Incoming request:', {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body
    });
    next();
}
