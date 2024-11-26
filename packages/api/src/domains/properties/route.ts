import { Router } from 'express';
import { getPropertiesWithActiveJobs, getPropertyOptions, getPropertyBoundaries, getProperties, getProperty, createProperty, updateProperty, deleteProperty, bulkDeleteProperties } from '.';
import { searchProperties } from './handlers/propertySearch';
import { getPropertyLocation, updatePropertyLocation, updatePropertyBoundary, deletePropertyBoundary } from './handlers/propertyLocation';

const router = Router();

// Base property routes
router.get('/', getProperties);
router.post('/', createProperty);

// Special property routes
router.get('/with-active-jobs', getPropertiesWithActiveJobs);
router.get('/options', getPropertyOptions);
router.get('/boundaries', getPropertyBoundaries);
router.get('/search', searchProperties);
router.post('/bulk-delete', bulkDeleteProperties);

// ID-based routes
router.get('/:id', getProperty);
router.put('/:id', updateProperty);
router.delete('/:id', deleteProperty);

// Location routes
router.get('/:id/location', getPropertyLocation);
router.put('/:id/location', updatePropertyLocation);
router.put('/:id/boundary', updatePropertyBoundary);
router.delete('/:id/boundary', deletePropertyBoundary);

export { router as propertiesRouter };
