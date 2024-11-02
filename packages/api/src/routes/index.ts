import { Router } from 'express';
import accountsRouter, { createAccount, updateAccount, listAccounts, deleteAccount } from './accounts';
import propertiesRouter from './properties';
import jobsRouter from './jobs';
import settingsRouter from './settings';
import addressesRouter from './addresses';
import equipmentTypesRouter from './equipment_types';
import fieldEquipmentRouter from './field_equipment';

const router = Router();

// Account routes
router.get('/accounts', listAccounts);
router.post('/accounts', createAccount);
router.put('/accounts/:id', updateAccount);
router.delete('/accounts/:id', deleteAccount);

// Properties routes
router.use('/properties', propertiesRouter);

// Jobs routes
router.use('/jobs', jobsRouter);

// Settings routes
router.use('/settings', settingsRouter);

// Addresses routes
router.use('/addresses', addressesRouter);

// Equipment routes
router.use('/equipment_types', equipmentTypesRouter);
router.use('/field_equipment', fieldEquipmentRouter);

export default router;
