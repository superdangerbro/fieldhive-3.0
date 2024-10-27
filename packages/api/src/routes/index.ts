import { Router } from 'express';
import accountRouter from './accounts';
import dashboardRouter from './dashboard';
import fieldRouter from './fields';
import healthRouter from './health';
import propertyRouter from './properties';
import sensorRouter from './sensors';

const router = Router();

router.use('/accounts', accountRouter);
router.use('/dashboard', dashboardRouter);
router.use('/fields', fieldRouter);
router.use('/health', healthRouter);
router.use('/properties', propertyRouter);
router.use('/sensors', sensorRouter);

export default router;
