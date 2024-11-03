import { Router } from 'express';
import { getPropertyStatuses, updatePropertyStatuses } from './handler';

const router = Router();

router.get('/properties/statuses', getPropertyStatuses);
router.put('/properties/statuses', updatePropertyStatuses);

export default router;
