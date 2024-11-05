import { Router } from 'express';
import { getPropertyTypes, updatePropertyTypes } from './handler';

const router = Router();

router.get('/', getPropertyTypes);
router.put('/', updatePropertyTypes);

export default router;
