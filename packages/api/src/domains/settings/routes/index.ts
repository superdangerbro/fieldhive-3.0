import { Router } from 'express';
import { getSetting, createSetting, updateSetting } from './handlers';
import { getEquipmentStatuses, updateEquipmentStatuses } from './equipmentStatusHandler';
import { getEquipmentTypes, updateEquipmentTypes } from './equipmentTypeHandler';

const router = Router();

// Equipment status routes
router.get('/equipment_statuses', getEquipmentStatuses);
router.put('/equipment_statuses', updateEquipmentStatuses);

// Equipment type routes
router.get('/equipment_types', getEquipmentTypes);
router.put('/equipment_types', updateEquipmentTypes);

// General settings routes
router.get('/:id', getSetting);
router.post('/', createSetting);
router.put('/:id', updateSetting);

export default router;
