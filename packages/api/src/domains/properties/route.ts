import { Router } from 'express';
import { getPropertiesWithActiveJobs, getPropertyOptions, getPropertyBoundaries, getProperties, getProperty, createProperty, updateProperty, deleteProperty, bulkDeleteProperties } from '.';
import { searchProperties } from './handlers/propertySearch';

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

export { router as propertiesRouter };
