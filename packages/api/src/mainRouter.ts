import { Router } from 'express';
import { accountsRouter } from './domains/accounts';
import { addressesRouter } from './domains/addresses';
import { propertiesRouter } from './domains/properties';
import { jobsRouter } from './domains/jobs';
import { equipmentRouter } from './domains/equipment';
import { inspectionsRouter } from './domains/inspections';
import { fieldsRouter } from './domains/fields';
import { sensorsRouter } from './domains/sensors';
import { healthRouter } from './domains/health';
import { authRouter } from './domains/auth';
import settingsRouter from './domains/settings/mainRouter';
import { logger } from './utils/logger';

const router = Router();

// Debug middleware to log all routes
router.use((req, res, next) => {
    logger.info('Route accessed:', {
        path: req.path,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body
    });
    next();
});

// Mount domain routes
if (accountsRouter) router.use('/accounts', accountsRouter);
if (addressesRouter) router.use('/addresses', addressesRouter);
if (propertiesRouter) router.use('/properties', propertiesRouter);
if (jobsRouter) router.use('/jobs', jobsRouter);
if (equipmentRouter) router.use('/equipment', equipmentRouter);
if (inspectionsRouter) router.use('/inspections', inspectionsRouter);
if (fieldsRouter) router.use('/fields', fieldsRouter);
if (sensorsRouter) router.use('/sensors', sensorsRouter);
if (healthRouter) router.use('/health', healthRouter);
if (settingsRouter) router.use('/settings', settingsRouter);
if (authRouter) router.use('/auth', authRouter);

// Catch-all route for debugging
router.use('*', (req, res) => {
    logger.warn('No route matched:', {
        path: req.path,
        method: req.method
    });
    res.status(404).json({
        error: 'Not found',
        message: `No route found for ${req.method} ${req.path}`
    });
});

export { router };
