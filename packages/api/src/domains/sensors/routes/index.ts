import { Router } from 'express';
import { getSensor, createSensor, updateSensor, archiveSensor } from './handlers';

const router = Router();

// Get sensor by ID
router.get('/:id', getSensor);

// Create new sensor
router.post('/', createSensor);

// Update sensor
router.put('/:id', updateSensor);

// Archive sensor
router.post('/:id/archive', archiveSensor);

export default router;
