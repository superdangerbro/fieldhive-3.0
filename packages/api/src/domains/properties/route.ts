import { Router } from 'express';
import { 
    getProperties,
    getProperty, 
    createProperty, 
    updateProperty, 
    deleteProperty,
    bulkDeleteProperties,
    getPropertyLocation,
    updatePropertyLocation,
    updatePropertyBoundary
} from './handlers';

const router = Router();

// Get all properties with pagination and filtering
router.get('/', getProperties as any);

// Get property by ID
router.get('/:id', getProperty as any);

// Create new property
router.post('/', createProperty as any);

// Update property
router.put('/:id', updateProperty as any);

// Delete property
router.delete('/:id', deleteProperty as any);

// Bulk delete properties
router.post('/bulk-delete', bulkDeleteProperties);

// Property location endpoints
router.get('/:id/location', getPropertyLocation);
router.put('/:id/location', updatePropertyLocation);

// Property boundary endpoint
router.put('/:id/boundary', updatePropertyBoundary);

export default router;
