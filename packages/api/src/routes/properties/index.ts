import { Router } from 'express';
import { listProperties } from './list';
import { createProperty } from './create';
import { updateProperty } from './update';
import { deleteProperty, archiveProperty } from './delete';
import { getPropertyLocation } from './location';
import { getPropertyAddresses } from './addresses';
import { updatePropertyMetadata } from './metadata';
import { getPropertiesInBounds } from './spatial';

const router = Router();

// Static routes first
router.get('/spatial/bounds', getPropertiesInBounds);

// Then parameterized routes
router.get('/', listProperties);
router.post('/', createProperty);
router.put('/:id', updateProperty);
router.put('/:id/metadata', updatePropertyMetadata);
router.delete('/:id', deleteProperty);
router.post('/:id/archive', archiveProperty);
router.get('/:id/location', getPropertyLocation);
router.get('/:id/addresses', getPropertyAddresses);

export default router;
