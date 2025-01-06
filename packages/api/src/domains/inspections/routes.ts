import { Router } from 'express';
import * as inspectionJobHandler from './handlers/inspectionJobs';
import * as equipmentInspectionHandler from './handlers/equipmentInspections';

const router = Router();

// Inspection Jobs routes
router.get('/jobs', inspectionJobHandler.getInspectionJobs);
router.get('/jobs/:id', inspectionJobHandler.getInspectionJob);
router.post('/jobs', inspectionJobHandler.createInspectionJob);
router.put('/jobs/:id', inspectionJobHandler.updateInspectionJob);
router.delete('/jobs/:id', inspectionJobHandler.deleteInspectionJob);

// Equipment Inspections routes
router.get('/equipment', equipmentInspectionHandler.getEquipmentInspections);
router.get('/equipment/:id', equipmentInspectionHandler.getEquipmentInspection);
router.post('/equipment', equipmentInspectionHandler.createEquipmentInspection);
router.put('/equipment/:id', equipmentInspectionHandler.updateEquipmentInspection);
router.delete('/equipment/:id', equipmentInspectionHandler.deleteEquipmentInspection);

export { router as inspectionsRouter };
