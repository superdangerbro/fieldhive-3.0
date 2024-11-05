import { Router } from 'express';
import { 
    getProperties,
    getProperty, 
    createProperty, 
    updateProperty, 
    updatePropertyMetadata,
    archiveProperty,
    getPropertyLocation,
    updatePropertyLocation,
    updatePropertyBoundary,
    updateServiceAddress,
    updateBillingAddress
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

// Update property metadata
router.patch('/:id/metadata', updatePropertyMetadata);

// Get property location
router.get('/:id/location', getPropertyLocation);

// Update property location
router.put('/:id/location', updatePropertyLocation);

// Update property boundary
router.put('/:id/boundary', updatePropertyBoundary);

// Update service address
router.put('/:id/address/service', updateServiceAddress);

// Update billing address
router.put('/:id/address/billing', updateBillingAddress);

// Archive property
router.post('/:id/archive', archiveProperty);

export default router;
