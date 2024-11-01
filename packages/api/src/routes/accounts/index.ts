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

// Re-export types for backwards compatibility
export * from './types';

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

/**
 * For backwards compatibility, export individual handlers
 * This allows existing code to continue working while
 * we transition to the new modular structure
 */
export {
    createAccount,
    listAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    linkProperty,
    unlinkProperty
};

/**
 * Export validation utilities for external use
 */
export {
    validateCreateAccountRequest,
    validateUpdateAccountRequest,
    validatePropertyLink,
    isValidType,
    isValidStatus
} from './validation';

/**
 * Export queries for external use
 * This allows other modules to use our SQL queries
 * while maintaining consistency
 */
export {
    GET_ACCOUNTS_QUERY,
    CREATE_ACCOUNT_QUERY,
    UPDATE_ACCOUNT_QUERY,
    DELETE_ACCOUNT_QUERY,
    COUNT_ACCOUNTS_QUERY,
    GET_ACCOUNT_PROPERTIES_QUERY
} from './queries';

/**
 * Example Usage:
 * 
 * Using the router (recommended):
 * ```typescript
 * import accountsRouter from './routes/accounts';
 * app.use('/accounts', accountsRouter);
 * ```
 * 
 * Using individual handlers (backwards compatibility):
 * ```typescript
 * import { createAccount, updateAccount } from './routes/accounts';
 * router.post('/custom-accounts', validateCreateAccountRequest, createAccount);
 * ```
 * 
 * Using types:
 * ```typescript
 * import { AccountResponse, CreateAccountDto } from './routes/accounts';
 * ```
 * 
 * Using validation:
 * ```typescript
 * import { validateCreateAccountRequest } from './routes/accounts';
 * router.post('/accounts', validateCreateAccountRequest, customHandler);
 * ```
 */
