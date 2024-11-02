import { Router } from 'express';
import { getProperty, createProperty, updateProperty, archiveProperty } from './handlers';

const router = Router();

// Get property by ID
router.get('/:id', getProperty);

// Create new property
router.post('/', createProperty);

// Update property
router.put('/:id', updateProperty);

// Archive property
router.post('/:id/archive', archiveProperty);

export default router;
