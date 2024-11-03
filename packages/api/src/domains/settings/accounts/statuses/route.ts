import { Router } from 'express';
import { getAccountStatuses, updateAccountStatuses } from './handler';

const router = Router();

router.get('/accounts/statuses', getAccountStatuses);
router.put('/accounts/statuses', updateAccountStatuses);

export default router;
