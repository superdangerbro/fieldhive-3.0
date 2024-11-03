import { Router } from 'express';
import { getPropertyTypes, updatePropertyTypes } from './handler';

const router = Router();

router.get('/properties/types', getPropertyTypes);
router.put('/properties/types', updatePropertyTypes);

export default router;
