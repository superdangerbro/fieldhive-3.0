/**
 * Account-related components
 */

export { AccountDetails } from './AccountDetails';
export { AccountSearch } from './AccountSearch';
export { AccountsTable } from './AccountsTable';

/**
 * Example Usage:
 * ```typescript
 * import { AccountDetails, AccountSearch, AccountsTable } from './components';
 * 
 * // Account details
 * <AccountDetails
 *   account={selectedAccount}
 *   onUpdate={handleUpdate}
 *   onAccountSelect={handleAccountSelect}
 * />
 * 
 * // Account search
 * <AccountSearch
 *   accounts={accounts}
 *   selectedAccount={selectedAccount}
 *   onAccountSelect={handleAccountSelect}
 *   onAddClick={() => setIsAddDialogOpen(true)}
 * />
 * 
 * // Accounts table
 * <AccountsTable
 *   refreshTrigger={refreshTrigger}
 *   onAccountSelect={handleAccountSelect}
 *   selectedAccount={selectedAccount}
 *   onAccountsLoad={handleAccountsLoad}
 * />
 * ```
 */
