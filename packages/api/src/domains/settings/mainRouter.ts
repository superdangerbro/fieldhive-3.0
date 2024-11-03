import { Router } from 'express';
import { getAccountStatuses, updateAccountStatuses } from './accounts/statuses/handler';
import { getAccountTypes, updateAccountTypes } from './accounts/types/handler';
import { getJobStatuses, updateJobStatuses } from './jobs/statuses/handler';
import { getJobTypes, updateJobTypes } from './jobs/types/handler';
import { getEquipmentStatuses, updateEquipmentStatuses } from './equipment/statuses/handler';
import { getEquipmentTypes, updateEquipmentTypes } from './equipment/types/handler';
import { getPropertyStatuses, updatePropertyStatuses } from './properties/statuses/handler';
import { getPropertyTypes, updatePropertyTypes } from './properties/types/handler';

const router = Router();

// Account routes
router.get('/accounts/statuses', getAccountStatuses);
router.put('/accounts/statuses', updateAccountStatuses);
router.get('/accounts/types', getAccountTypes);
router.put('/accounts/types', updateAccountTypes);

// Job routes
router.get('/jobs/statuses', getJobStatuses);
router.put('/jobs/statuses', updateJobStatuses);
router.get('/jobs/types', getJobTypes);
router.put('/jobs/types', updateJobTypes);

// Equipment routes
router.get('/equipment/statuses', getEquipmentStatuses);
router.put('/equipment/statuses', updateEquipmentStatuses);
router.get('/equipment/types', getEquipmentTypes);
router.put('/equipment/types', updateEquipmentTypes);

// Property routes
router.get('/properties/statuses', getPropertyStatuses);
router.put('/properties/statuses', updatePropertyStatuses);
router.get('/properties/types', getPropertyTypes);
router.put('/properties/types', updatePropertyTypes);

export default router;
