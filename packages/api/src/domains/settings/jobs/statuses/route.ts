import { Router } from 'express';
import { getJobStatuses, updateJobStatuses } from './handler';

const router = Router();

router.get('/jobs/statuses', getJobStatuses);
router.put('/jobs/statuses', updateJobStatuses);

export default router;
