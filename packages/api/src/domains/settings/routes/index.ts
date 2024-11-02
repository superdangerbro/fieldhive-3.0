import { Router } from 'express';
import { getSetting, createSetting, updateSetting } from './handlers';

const router = Router();

// Get setting by ID
router.get('/:id', getSetting);

// Create new setting
router.post('/', createSetting);

// Update setting
router.put('/:id', updateSetting);

export default router;
