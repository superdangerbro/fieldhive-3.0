import { Router } from 'express';
import accountsRouter from './accounts';
import dashboardRouter from './dashboard';
import equipmentTypesRouter from './equipment_types';
import fieldEquipmentRouter from './field_equipment';
import fieldsRouter from './fields';
import healthRouter from './health';
import inspectionsRouter from './inspections';
import jobTypesRouter from './job_types';
import jobsRouter from './jobs';
import propertiesRouter from './properties';
import sensorsRouter from './sensors';

const router = Router();

router.use('/accounts', accountsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/equipment_types', equipmentTypesRouter);
router.use('/field_equipment', fieldEquipmentRouter);
router.use('/fields', fieldsRouter);
router.use('/health', healthRouter);
router.use('/inspections', inspectionsRouter);
router.use('/job_types', jobTypesRouter);
router.use('/jobs', jobsRouter);
router.use('/properties', propertiesRouter);
router.use('/sensors', sensorsRouter);

export default router;
