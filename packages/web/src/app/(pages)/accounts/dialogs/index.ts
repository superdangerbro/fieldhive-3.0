/**
 * Account-related dialogs
 */

export { AddAccountDialog } from './AddAccountDialog';
export { DeleteAccountDialog } from './DeleteAccountDialog';
export { EditAddressDialog } from './EditAddressDialog';

/**
 * Example Usage:
 * ```typescript
 * import { AddAccountDialog, DeleteAccountDialog, EditAddressDialog } from '../dialogs';
 * 
 * // Add Account
 * <AddAccountDialog
 *   open={isAddDialogOpen}
 *   onClose={() => setIsAddDialogOpen(false)}
 *   onAccountAdded={handleAccountAdded}
 * />
 * 
 * // Delete Account
 * <DeleteAccountDialog
 *   open={isDeleteDialogOpen}
 *   accountId={selectedAccount.account_id}
 *   onClose={() => setDeleteDialogOpen(false)}
 *   onDeleted={handleAccountDeleted}
 * />
 * 
 * // Edit Address
 * <EditAddressDialog
 *   open={isEditAddressOpen}
 *   title="Edit Billing Address"
 *   initialAddress={account.billingAddress}
 *   onClose={() => setEditAddressOpen(false)}
 *   onSave={handleAddressSaved}
 * />
 * ```
 */
