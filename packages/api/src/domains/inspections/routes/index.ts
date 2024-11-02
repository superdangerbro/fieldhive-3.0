import { Router } from 'express';
import { getInspection, createInspection, updateInspection, archiveInspection } from './handlers';

const router = Router();

// Get inspection by ID
router.get('/:id', getInspection);

// Create new inspection
router.post('/', createInspection);

// Update inspection
router.put('/:id', updateInspection);

// Archive inspection
router.post('/:id/archive', archiveInspection);

export default router;
