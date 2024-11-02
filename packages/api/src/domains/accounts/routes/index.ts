import { Router } from 'express';
import { getAccount, createAccount, updateAccount, archiveAccount, listAccounts } from './handlers';

const router = Router();

// List all accounts
router.get('/', listAccounts);

// Get account by ID
router.get('/:id', getAccount);

// Create new account
router.post('/', createAccount);

// Update account
router.put('/:id', updateAccount);

// Archive account
router.post('/:id/archive', archiveAccount);

export default router;
