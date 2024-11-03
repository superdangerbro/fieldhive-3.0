import { Router } from 'express';
import { getFields, getField, createField, updateField, archiveField } from './handler';

const router = Router();

// Get all fields with optional filters
router.get('/', getFields);

// Get field by ID
router.get('/:id', getField);

// Create new field
router.post('/', createField);

// Update field
router.put('/:id', updateField);

// Archive field
router.post('/:id/archive', archiveField);

export default router;
