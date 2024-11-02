import { Router } from 'express';
import accountsRouter from '../domains/accounts/routes';
import addressesRouter from '../domains/addresses/routes';
import propertiesRouter from '../domains/properties/routes';
import jobsRouter from '../domains/jobs/routes';
import inspectionsRouter from '../domains/inspections/routes';
import settingsRouter from '../domains/settings/routes';

const router = Router();

// Mount domain routes
if (accountsRouter) router.use('/accounts', accountsRouter);
if (addressesRouter) router.use('/addresses', addressesRouter);
if (propertiesRouter) router.use('/properties', propertiesRouter);
if (jobsRouter) router.use('/jobs', jobsRouter);
if (inspectionsRouter) router.use('/inspections', inspectionsRouter);
if (settingsRouter) router.use('/settings', settingsRouter);

export default router;
