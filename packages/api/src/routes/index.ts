import { Router } from 'express';
import accountRouter from './accounts';
import dashboardRouter from './dashboard';
import fieldRouter from './fields';
import healthRouter from './health';
import propertyRouter from './properties';
import sensorRouter from './sensors';
import jobTypeRouter from './job-types';
import jobRouter from './jobs';
import fieldEquipmentRouter from './field-equipment';
import equipmentTypeRouter from './equipment-types';
import inspectionRouter from './inspections';

const router = Router();

router.use('/accounts', accountRouter);
router.use('/dashboard', dashboardRouter);
router.use('/fields', fieldRouter);
router.use('/health', healthRouter);
router.use('/properties', propertyRouter);
router.use('/sensors', sensorRouter);
router.use('/job-types', jobTypeRouter);
router.use('/jobs', jobRouter);
router.use('/field-equipment', fieldEquipmentRouter);
router.use('/equipment-types', equipmentTypeRouter);
router.use('/inspections', inspectionRouter);

export default router;
