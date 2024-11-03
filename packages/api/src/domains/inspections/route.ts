import { Router } from 'express';
import { getInspections, getInspection, createInspection, updateInspection, archiveInspection } from './handler';

const router = Router();

// Get all inspections with optional filters
router.get('/', getInspections);

// Get inspection by ID
router.get('/:id', getInspection);

// Create new inspection
router.post('/', createInspection);

// Update inspection
router.put('/:id', updateInspection);

// Archive inspection
router.post('/:id/archive', archiveInspection);

export default router;
