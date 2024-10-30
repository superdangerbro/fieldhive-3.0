import { Router } from 'express';
import { createAccount } from './accounts/create';
import { updateAccount } from './accounts/update';
import { listAccounts } from './accounts/list';
import { deleteAccount, archiveAccount } from './accounts/delete';
import { listProperties } from './properties/list';
import { createProperty } from './properties/create';
import { updateProperty } from './properties/update';
import { deleteProperty, archiveProperty } from './properties/delete';
import jobsRouter from './jobs';
import settingsRouter from './settings';

const router = Router();

// Account routes
router.get('/accounts', listAccounts);
router.post('/accounts', createAccount);
router.put('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);
router.post('/accounts/:id/archive', archiveAccount);

// Property routes
router.get('/properties', listProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);
router.post('/properties/:id/archive', archiveProperty);

// Jobs routes
router.use('/jobs', jobsRouter);

// Settings routes
router.use('/settings', settingsRouter);

export default router;
