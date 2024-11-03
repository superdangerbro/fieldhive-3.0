import { Router } from 'express';
import { getEquipment, getEquipmentById, createEquipment, updateEquipment, archiveEquipment } from './handler';

const router = Router();

// Get all equipment with optional filters
router.get('/', getEquipment);

// Get equipment by ID
router.get('/:id', getEquipmentById);

// Create new equipment
router.post('/', createEquipment);

// Update equipment
router.put('/:id', updateEquipment);

// Archive equipment
router.post('/:id/archive', archiveEquipment);

export default router;
