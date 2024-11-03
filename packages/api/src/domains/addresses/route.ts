import { Router } from 'express';
import { getAddress, getAddresses, createAddress, updateAddress } from './handler';

const router = Router();

// Get all addresses with optional filters
router.get('/', getAddresses);

// Get address by ID
router.get('/:id', getAddress);

// Create new address
router.post('/', createAddress);

// Update address
router.put('/:id', updateAddress);

export default router;
