import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import { CreateAccountDto, UpdateAccountDto, AccountResponse, AccountStatus } from '@fieldhive/shared';

const router = Router();

// Get all accounts
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        const [accounts, total] = await Promise.all([
            AppDataSource.query(`
                SELECT 
                    a.account_id as id,
                    a.name,
                    a.created_at as "createdAt",
                    a.updated_at as "updatedAt",
                    a.is_company as "isCompany",
                    b.address_1 as "street",
                    b.city,
                    b.province as state,
                    b.postal_code as "zipCode",
                    b.country
                FROM accounts a
                LEFT JOIN properties_accounts_join pa ON pa.account_id = a.account_id
                LEFT JOIN properties p ON p.property_id = pa.property_id
                LEFT JOIN billing_address b ON b.property_id = p.property_id
                ORDER BY a.created_at DESC
                LIMIT $1 OFFSET $2
            `, [pageSize, offset]),
            AppDataSource.query('SELECT COUNT(*) as total FROM accounts')
        ]);

        // Format response
        const formattedAccounts = accounts.map((account: any) => ({
            id: account.id,
            name: account.name,
            ...(account.street && {
                billingAddress: {
                    street: account.street,
                    city: account.city,
                    state: account.state,
                    zipCode: account.zipCode,
                    country: account.country
                }
            }),
            status: 'active' as AccountStatus,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        }));

        res.json({
            accounts: formattedAccounts,
            total: parseInt(total[0].total),
            page,
            pageSize
        });
    } catch (error) {
        logger.error('Error fetching accounts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch accounts'
        });
    }
});

// Get account by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [account] = await AppDataSource.query(`
            SELECT 
                a.account_id as id,
                a.name,
                a.created_at as "createdAt",
                a.updated_at as "updatedAt",
                a.is_company as "isCompany",
                b.address_1 as "street",
                b.city,
                b.province as state,
                b.postal_code as "zipCode",
                b.country
            FROM accounts a
            LEFT JOIN properties_accounts_join pa ON pa.account_id = a.account_id
            LEFT JOIN properties p ON p.property_id = pa.property_id
            LEFT JOIN billing_address b ON b.property_id = p.property_id
            WHERE a.account_id = $1
        `, [id]);

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        // Restructure the response to match the expected format
        const response: AccountResponse = {
            id: account.id,
            name: account.name,
            ...(account.street && {
                billingAddress: {
                    street: account.street,
                    city: account.city,
                    state: account.state,
                    zipCode: account.zipCode,
                    country: account.country
                }
            }),
            status: 'active', // Default status
            createdAt: account.createdAt,
            updatedAt: account.updatedAt
        };

        res.json(response);
    } catch (error) {
        logger.error('Error fetching account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch account'
        });
    }
});

// Create new account
router.post('/', async (req, res) => {
    try {
        const { name, status = 'active' } = req.body as CreateAccountDto;

        if (!name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name is required'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Create account
            const [account] = await AppDataSource.query(`
                INSERT INTO accounts (name, created_at, updated_at)
                VALUES ($1, NOW(), NOW())
                RETURNING account_id as id, name, created_at as "createdAt", updated_at as "updatedAt"
            `, [name]);

            await AppDataSource.query('COMMIT');

            const response: AccountResponse = {
                ...account,
                status
            };

            res.status(201).json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account'
        });
    }
});

// Update account
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status = 'active' } = req.body as UpdateAccountDto;

        if (!name && !status) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'No updates provided'
            });
        }

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            let account;

            if (name) {
                [account] = await AppDataSource.query(`
                    UPDATE accounts
                    SET name = $1, updated_at = NOW()
                    WHERE account_id = $2
                    RETURNING account_id as id, name, created_at as "createdAt", updated_at as "updatedAt"
                `, [name, id]);

                if (!account) {
                    await AppDataSource.query('ROLLBACK');
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Account not found'
                    });
                }
            }

            await AppDataSource.query('COMMIT');

            // Get updated account data
            const [updatedAccount] = await AppDataSource.query(`
                SELECT 
                    a.account_id as id,
                    a.name,
                    a.created_at as "createdAt",
                    a.updated_at as "updatedAt",
                    b.address_1 as "street",
                    b.city,
                    b.province as state,
                    b.postal_code as "zipCode",
                    b.country
                FROM accounts a
                LEFT JOIN properties_accounts_join pa ON pa.account_id = a.account_id
                LEFT JOIN properties p ON p.property_id = pa.property_id
                LEFT JOIN billing_address b ON b.property_id = p.property_id
                WHERE a.account_id = $1
            `, [id]);

            const response: AccountResponse = {
                id: updatedAccount.id,
                name: updatedAccount.name,
                ...(updatedAccount.street && {
                    billingAddress: {
                        street: updatedAccount.street,
                        city: updatedAccount.city,
                        state: updatedAccount.state,
                        zipCode: updatedAccount.zipCode,
                        country: updatedAccount.country
                    }
                }),
                status,
                createdAt: updatedAccount.createdAt,
                updatedAt: updatedAccount.updatedAt
            };

            res.json(response);
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update account'
        });
    }
});

// Delete account
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Get property ID
            const [propertyJoin] = await AppDataSource.query(`
                SELECT p.property_id, p.billing_address
                FROM properties_accounts_join paj
                JOIN properties p ON p.property_id = paj.property_id
                WHERE paj.account_id = $1
                LIMIT 1
            `, [id]);

            if (propertyJoin) {
                // Delete billing address
                await AppDataSource.query(`
                    DELETE FROM billing_address
                    WHERE property_id = $1
                `, [propertyJoin.property_id]);

                // Delete property-account join
                await AppDataSource.query(`
                    DELETE FROM properties_accounts_join
                    WHERE account_id = $1
                `, [id]);

                // Delete property
                await AppDataSource.query(`
                    DELETE FROM properties
                    WHERE property_id = $1
                `, [propertyJoin.property_id]);
            }

            // Delete account
            const [result] = await AppDataSource.query(`
                DELETE FROM accounts
                WHERE account_id = $1
                RETURNING account_id
            `, [id]);

            if (!result) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Account not found'
                });
            }

            await AppDataSource.query('COMMIT');
            res.status(204).send();
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete account'
        });
    }
});

export default router;
