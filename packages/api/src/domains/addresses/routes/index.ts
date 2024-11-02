import { Router } from 'express';
import { getAddress, createAddress, updateAddress } from './handlers';

const router = Router();

// Get address by ID
router.get('/:id', getAddress);

// Create address
router.post('/', createAddress);

// Update address
router.put('/:id', updateAddress);

export default router;
