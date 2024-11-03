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
import settingsRouter from './domains/settings/mainRouter';

const router = Router();

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

export default router;
