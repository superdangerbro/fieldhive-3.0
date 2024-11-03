import { Router } from 'express';
import { getEquipmentTypes, updateEquipmentTypes } from './handler';

const router = Router();

router.get('/equipment/types', getEquipmentTypes);
router.put('/equipment/types', updateEquipmentTypes);

export default router;
