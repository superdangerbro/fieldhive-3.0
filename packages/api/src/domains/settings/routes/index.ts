import { Router } from 'express';
import { getSetting, createSetting, updateSetting } from './handlers';
import { getEquipmentStatuses, updateEquipmentStatuses } from './equipmentStatusHandler';
import { getEquipmentTypes, updateEquipmentTypes } from './equipmentTypeHandler';
import { getJobStatuses, updateJobStatuses } from './jobStatusHandler';
import { getJobTypes, updateJobTypes } from './jobTypeHandler';
import { getAccountStatuses, updateAccountStatuses } from './accountStatusHandler';
import { getAccountTypes, updateAccountTypes } from './accountTypeHandler';

const router = Router();

// Equipment status routes
router.get('/equipment_statuses', getEquipmentStatuses);
router.put('/equipment_statuses', updateEquipmentStatuses);

// Equipment type routes
router.get('/equipment_types', getEquipmentTypes);
router.put('/equipment_types', updateEquipmentTypes);

// Job status routes
router.get('/job_statuses', getJobStatuses);
router.put('/job_statuses', updateJobStatuses);

// Job type routes
router.get('/job_types', getJobTypes);
router.put('/job_types', updateJobTypes);

// Account status routes
router.get('/account_statuses', getAccountStatuses);
router.put('/account_statuses', updateAccountStatuses);

// Account type routes
router.get('/account_types', getAccountTypes);
router.put('/account_types', updateAccountTypes);

// General settings routes
router.get('/:id', getSetting);
router.post('/', createSetting);
router.put('/:id', updateSetting);

export default router;
