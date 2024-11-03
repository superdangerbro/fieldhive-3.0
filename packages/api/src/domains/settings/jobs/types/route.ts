import { Router } from 'express';
import { getJobTypes, updateJobTypes } from './handler';

const router = Router();

router.get('/jobs/types', getJobTypes);
router.put('/jobs/types', updateJobTypes);

export default router;
