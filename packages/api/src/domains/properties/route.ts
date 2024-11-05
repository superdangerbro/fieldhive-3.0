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
} from './handler';

const router = Router();

// Get all properties with pagination and filtering
router.get('/', getProperties);

// Get property by ID
router.get('/:id', getProperty);

// Create new property
router.post('/', createProperty);

// Update property
router.put('/:id', updateProperty);

// Delete property
router.delete('/:id', deleteProperty);

// Bulk delete properties
router.post('/bulk-delete', bulkDeleteProperties);

// Property location endpoints
router.get('/:id/location', getPropertyLocation);
router.put('/:id/location', updatePropertyLocation);

// Property boundary endpoint
router.put('/:id/boundary', updatePropertyBoundary);

export default router;
