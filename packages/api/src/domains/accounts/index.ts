/**
 * Account Domain Exports
 */

// Entity
export { Account } from './entities/Account';

// Types
export {
    AccountType,
    AccountStatus,
    CreateAccountDto,
    UpdateAccountDto,
    AccountResponse,
    AccountFilters,
    AccountWithRelations
} from './types';

// Service
export { AccountService } from './services/accountService';

// Routes
export { default as accountRoutes } from './routes';

/**
 * Example Usage:
 * ```typescript
 * import { 
 *   Account,
 *   AccountService,
 *   CreateAccountDto,
 *   accountRoutes 
 * } from './domains/accounts';
 * 
 * // Use in Express app
 * app.use('/api/accounts', accountRoutes);
 * 
 * // Use service in other domains
 * const accountService = new AccountService();
 * const account = await accountService.findById(id);
 * ```
 */
