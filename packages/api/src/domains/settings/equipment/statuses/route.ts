import { Router } from 'express';
import { getEquipmentStatuses, updateEquipmentStatuses } from './handler';

const router = Router();

router.get('/equipment/statuses', getEquipmentStatuses);
router.put('/equipment/statuses', updateEquipmentStatuses);

export default router;
