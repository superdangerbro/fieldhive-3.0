import { Router } from 'express';
import { getEquipment, createEquipment, updateEquipment, archiveEquipment } from './handlers';

const router = Router();

// Get equipment by ID
router.get('/:id', getEquipment);

// Create new equipment
router.post('/', createEquipment);

// Update equipment
router.put('/:id', updateEquipment);

// Archive equipment
router.post('/:id/archive', archiveEquipment);

export default router;
