import { Router } from 'express';
import metricsRouter from './metrics';
import activityRouter from './activity';

const router = Router();

router.use(metricsRouter);
router.use(activityRouter);

export default router;
