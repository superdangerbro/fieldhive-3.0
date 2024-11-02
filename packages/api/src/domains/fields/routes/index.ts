import { Router } from 'express';
import { getField, createField, updateField, archiveField } from './handlers';

const router = Router();

// Get field by ID
router.get('/:id', getField);

// Create new field
router.post('/', createField);

// Update field
router.put('/:id', updateField);

// Archive field
router.post('/:id/archive', archiveField);

export default router;
