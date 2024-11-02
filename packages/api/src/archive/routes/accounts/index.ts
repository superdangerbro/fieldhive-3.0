import { Router } from 'express';
import { createAccount } from './handlers/create';
import { listAccounts, getAccountById } from './handlers/list';
import { updateAccount, linkProperty, unlinkProperty } from './handlers/update';
import { deleteAccount } from './handlers/delete';
import { 
    validateCreateAccountRequest, 
    validateUpdateAccountRequest,
    validatePropertyLink 
} from './validation';

// Re-export handlers for use in main router
export { 
    createAccount,
    listAccounts,
    updateAccount,
    deleteAccount,
    linkProperty,
    unlinkProperty
};

const router = Router();

/**
 * Account Routes
 * Organized with validation middleware and handlers
 */

// Create new account
router.post('/', validateCreateAccountRequest, createAccount);

// Get all accounts with pagination
router.get('/', listAccounts);

// Get single account
router.get('/:id', getAccountById);

// Update account
router.put('/:id', validateUpdateAccountRequest, updateAccount);

// Delete account
router.delete('/:id', deleteAccount);

// Property management
router.post('/:id/properties', validatePropertyLink, linkProperty);
router.delete('/:id/properties/:propertyId', unlinkProperty);

export default router;
