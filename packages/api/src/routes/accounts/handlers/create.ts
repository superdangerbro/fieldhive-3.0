import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { CreateAccountDto, AccountResponse } from '../types';
import { CREATE_ACCOUNT_QUERY, CREATE_ADDRESS_QUERY, GET_ACCOUNTS_QUERY } from '../queries';

/**
 * Create a new account
 * Handles:
 * - Account creation
 * - Billing address creation if provided
 * - Transaction management
 * - Response formatting
 */
export const createAccount = async (req: Request, res: Response) => {
    try {
        const {
            name,
            type,
            billing_address
        } = req.body as CreateAccountDto;

        logger.info('Creating new account:', {
            name,
            type
        });

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create billing address if provided
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

            // Create account
            const [newAccount] = await AppDataSource.query(
                CREATE_ACCOUNT_QUERY,
                [
                    name,
                    type,
                    'Active', // Default status
                    billingAddressId
                ]
            );

            await AppDataSource.query('COMMIT');

            // Fetch complete account data
            const [createdAccount] = await AppDataSource.query(
                `${GET_ACCOUNTS_QUERY} AND a.account_id = $1`,
                [newAccount.account_id]
            );

            const response: AccountResponse = {
                ...createdAccount,
                properties: createdAccount.properties || []
            };

            logger.info('Successfully created account:', newAccount.account_id);
            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
