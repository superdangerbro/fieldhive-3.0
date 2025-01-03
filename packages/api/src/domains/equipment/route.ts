import { Router } from 'express';
import { equipmentHandler } from './handler';

const router = Router();

// Get all equipment with optional filters
router.get('/', equipmentHandler.getEquipment.bind(equipmentHandler));

// Get equipment by ID
router.get('/:id', equipmentHandler.getEquipmentById.bind(equipmentHandler));

// Create new equipment
router.post('/', equipmentHandler.createEquipment.bind(equipmentHandler));

// Update equipment
router.put('/:id', equipmentHandler.updateEquipment.bind(equipmentHandler));

// Archive equipment
router.post('/:id/archive', equipmentHandler.archiveEquipment.bind(equipmentHandler));

export default router;
