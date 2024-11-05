import { Router } from 'express';
import { getPropertyStatuses, updatePropertyStatuses } from './handler';

const router = Router();

router.get('/', getPropertyStatuses);
router.put('/', updatePropertyStatuses);

export default router;
