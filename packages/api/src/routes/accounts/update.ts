import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { UpdateAccountDto } from '@fieldhive/shared';

export const updateAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body as UpdateAccountDto;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Update account
            const [account] = await AppDataSource.query(
                `UPDATE accounts 
                SET 
                    name = COALESCE($1, name),
                    is_company = COALESCE($2, is_company),
                    status = COALESCE($3, status),
                    updated_at = NOW()
                WHERE account_id = $4
                RETURNING 
                    account_id as id,
                    name,
                    is_company as "isCompany",
                    status,
                    created_at as "createdAt",
                    updated_at as "updatedAt"`,
                [updates.name, updates.isCompany, updates.status, id]
            );

            if (!account) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Account not found'
                });
            }

            // Update billing address if provided
            if (updates.billingAddress) {
                await AppDataSource.query(
                    `UPDATE account_billing_address
                    SET 
                        address1 = $1,
                        address2 = $2,
                        city = $3,
                        province = $4,
                        "postalCode" = $5,
                        country = $6,
                        updated_at = NOW()
                    WHERE account_id = $7`,
                    [
                        updates.billingAddress.address1,
                        updates.billingAddress.address2,
                        updates.billingAddress.city,
                        updates.billingAddress.province,
                        updates.billingAddress.postalCode,
                        updates.billingAddress.country,
                        id
                    ]
                );
            }

            // Get billing address
            const [billingAddress] = await AppDataSource.query(
                `SELECT 
                    address1,
                    address2,
                    city,
                    province,
                    "postalCode",
                    country
                FROM account_billing_address
                WHERE account_id = $1`,
                [id]
            );

            // Get associated properties
            const properties = await AppDataSource.query(
                `SELECT 
                    p.property_id as "propertyId",
                    p.name,
                    p.address,
                    paj.role,
                    CASE
                        WHEN pba.use_account_billing THEN json_build_object(
                            'useAccountBilling', true
                        )
                        ELSE json_build_object(
                            'useAccountBilling', false,
                            'address', json_build_object(
                                'address1', pba.address1,
                                'address2', pba.address2,
                                'city', pba.city,
                                'province', pba.province,
                                'postalCode', pba."postalCode",
                                'country', pba.country
                            )
                        )
                    END as "billingAddress"
                FROM properties p
                JOIN properties_accounts_join paj ON paj.property_id = p.property_id
                LEFT JOIN property_billing_address pba ON pba.property_id = p.property_id
                WHERE paj.account_id = $1`,
                [id]
            );

            await AppDataSource.query('COMMIT');

            const response = {
                ...account,
                billingAddress,
                properties
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
};
