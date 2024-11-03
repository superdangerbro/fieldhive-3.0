import { Router } from 'express';
import { getAccounts, getAccount, createAccount, updateAccount, archiveAccount, deleteAccount } from './handler';

const router = Router();

// Get all accounts with optional filters
router.get('/', getAccounts);

// Get account by ID
router.get('/:id', getAccount);

// Create new account
router.post('/', createAccount);

// Update account
router.put('/:id', updateAccount);

// Delete account
router.delete('/:id', deleteAccount);

// Archive account
router.post('/:id/archive', archiveAccount);

export default router;
