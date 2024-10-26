import { Router } from 'express';
import healthRoutes from './health.routes';
import accountRoutes from './account.routes';
import dashboardRoutes from './dashboard.routes';
import { logger } from '../utils/logger';

const router = Router();

// Log all requests
router.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

// Health check routes
router.use('/health', healthRoutes);

// Account management routes
router.use('/accounts', accountRoutes);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
    logger.error('API Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message || 'Something went wrong'
    });
});

export default router;
