import { Router } from 'express';
import { getSensors, getSensor, createSensor, updateSensor, archiveSensor } from './handler';

const router = Router();

// Get all sensors with optional filters
router.get('/', getSensors);

// Get sensor by ID
router.get('/:id', getSensor);

// Create new sensor
router.post('/', createSensor);

// Update sensor
router.put('/:id', updateSensor);

// Archive sensor
router.post('/:id/archive', archiveSensor);

export default router;
