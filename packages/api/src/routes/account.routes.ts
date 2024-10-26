import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';
import { CreateAccountDto, UpdateAccountDto, AccountResponse, AccountStatus } from '@fieldhive/shared';

const accountRouter = Router();

// Get all accounts
accountRouter.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info(`Fetching accounts with page ${page}, pageSize ${pageSize}, offset ${offset}`);

        const [accounts, total] = await Promise.all([
            AppDataSource.query(
                `SELECT 
                    a.account_id as id,
                    a.name,
                    a.created_at as "createdAt",
                    a.updated_at as "updatedAt",
                    a.is_company as "isCompany",
                    b.address_1 as "address1",
                    b.address_2 as "address2",
                    b.city,
                    b.province,
                    b.postal_code as "postalCode",
                    b.country
                FROM accounts a
                LEFT JOIN properties_accounts_join pa ON pa.account_id = a.account_id
                LEFT JOIN properties p ON p.property_id = pa.property_id
                LEFT JOIN billing_address b ON b.property_id = p.property_id
                ORDER BY a.created_at DESC
                LIMIT $1 OFFSET $2`,
                [Number(pageSize), Number(offset)]
            ),
            AppDataSource.query('SELECT COUNT(*) as total FROM accounts')
        ]);

        // Format response
        const formattedAccounts = accounts.map((account: any) => ({
            id: account.id,
            name: account.name,
            is_company: account.isCompany,
            ...(account.address1 && {
                billingAddress: {
                    address1: account.address1,
                    address2: account.address2,
                    city: account.city,
                    province: account.province,
                    postalCode: account.postalCode,
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

// Create new account
accountRouter.post('/', async (req, res) => {
    try {
        const { name, is_company = false, billingAddress, status = 'active' } = req.body as CreateAccountDto;

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
                INSERT INTO accounts (name, is_company, created_at, updated_at)
                VALUES ($1, $2, NOW(), NOW())
                RETURNING account_id as id, name, is_company as "isCompany", created_at as "createdAt", updated_at as "updatedAt"
            `, [name, is_company]);

            // If billing address provided, create property and address
            if (billingAddress) {
                // Create property
                const [property] = await AppDataSource.query(`
                    INSERT INTO properties (name, created_at, updated_at)
                    VALUES ($1, NOW(), NOW())
                    RETURNING property_id
                `, [name + ' Billing Property']);

                // Create property-account join
                await AppDataSource.query(`
                    INSERT INTO properties_accounts_join (property_id, account_id)
                    VALUES ($1, $2)
                `, [property.property_id, account.id]);

                // Create billing address
                await AppDataSource.query(`
                    INSERT INTO billing_address (
                        property_id,
                        address_1,
                        address_2,
                        city,
                        province,
                        postal_code,
                        country
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    property.property_id,
                    billingAddress.address1,
                    billingAddress.address2,
                    billingAddress.city,
                    billingAddress.province,
                    billingAddress.postalCode,
                    billingAddress.country
                ]);
            }

            await AppDataSource.query('COMMIT');

            const response: AccountResponse = {
                ...account,
                billingAddress,
                status: status as AccountStatus
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

export default accountRouter;
