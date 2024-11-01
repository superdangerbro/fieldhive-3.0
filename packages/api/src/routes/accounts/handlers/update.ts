import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { UpdateAccountDto, AccountResponse } from '../types';
import { 
    UPDATE_ACCOUNT_QUERY, 
    GET_ACCOUNTS_QUERY, 
    CHECK_ACCOUNT_EXISTS_QUERY,
    CREATE_ADDRESS_QUERY 
} from '../queries';

/**
 * Update an existing account
 * Handles:
 * - Account updates
 * - Billing address updates
 * - Transaction management
 * - Response formatting
 */
export const updateAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            name,
            type,
            status,
            billing_address
        } = req.body as UpdateAccountDto;

        logger.info('Updating account:', {
            id,
            name,
            type,
            status
        });

        // Verify account exists
        const [existingAccount] = await AppDataSource.query(
            CHECK_ACCOUNT_EXISTS_QUERY,
            [id]
        );

        if (!existingAccount) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create new billing address if provided
            let billingAddressId = null;
            if (billing_address) {
                const [newAddress] = await AppDataSource.query(
                    CREATE_ADDRESS_QUERY,
                    [
                        billing_address.address1,
                        billing_address.address2,
                        billing_address.city,
                        billing_address.province,
                        billing_address.postal_code,
                        billing_address.country
                    ]
                );
                billingAddressId = newAddress.address_id;
            }

            // Update account
            await AppDataSource.query(
                UPDATE_ACCOUNT_QUERY,
                [
                    name,
                    type,
                    status,
                    billingAddressId,
                    id
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch updated account with relations
            const [updatedAccount] = await AppDataSource.query(
                `${GET_ACCOUNTS_QUERY} AND a.account_id = $1`,
                [id]
            );

            const response: AccountResponse = {
                ...updatedAccount,
                properties: updatedAccount.properties || []
            };

            logger.info('Successfully updated account:', id);
            res.json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Link a property to an account
 */
export const linkProperty = async (req: Request, res: Response) => {
    try {
        const { id: accountId } = req.params;
        const { property_id, role } = req.body;

        logger.info('Linking property to account:', {
            accountId,
            property_id,
            role
        });

        await AppDataSource.query(
            'INSERT INTO properties_accounts (account_id, property_id, role) VALUES ($1, $2, $3)',
            [accountId, property_id, role]
        );

        res.status(204).send();
    } catch (error) {
        logger.error('Error linking property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to link property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Unlink a property from an account
 */
export const unlinkProperty = async (req: Request, res: Response) => {
    try {
        const { id: accountId, propertyId } = req.params;

        logger.info('Unlinking property from account:', {
            accountId,
            propertyId
        });

        await AppDataSource.query(
            'DELETE FROM properties_accounts WHERE account_id = $1 AND property_id = $2',
            [accountId, propertyId]
        );

        res.status(204).send();
    } catch (error) {
        logger.error('Error unlinking property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to unlink property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
