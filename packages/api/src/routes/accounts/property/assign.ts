import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { AssignPropertyDto } from '@fieldhive/shared';

export const assignProperty = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { propertyId, role, billingAddress } = req.body as AssignPropertyDto;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Verify account exists
            const [account] = await AppDataSource.query(
                'SELECT account_id FROM accounts WHERE account_id = $1',
                [id]
            );

            if (!account) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Account not found'
                });
            }

            // Verify property exists
            const [property] = await AppDataSource.query(
                'SELECT property_id FROM properties WHERE property_id = $1',
                [propertyId]
            );

            if (!property) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Property not found'
                });
            }

            // Create assignment
            await AppDataSource.query(
                `INSERT INTO properties_accounts_join (property_id, account_id, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (property_id, account_id) DO UPDATE
                SET role = $3`,
                [propertyId, id, role]
            );

            // Handle billing address
            if (billingAddress) {
                if (billingAddress.useAccountBilling) {
                    await AppDataSource.query(
                        `INSERT INTO property_billing_address (
                            property_id,
                            use_account_billing,
                            account_id
                        ) VALUES ($1, true, $2)
                        ON CONFLICT (property_id) DO UPDATE
                        SET 
                            use_account_billing = true,
                            account_id = $2,
                            address1 = NULL,
                            address2 = NULL,
                            city = NULL,
                            province = NULL,
                            "postalCode" = NULL,
                            country = NULL`,
                        [propertyId, id]
                    );
                } else if (billingAddress.address) {
                    await AppDataSource.query(
                        `INSERT INTO property_billing_address (
                            property_id,
                            use_account_billing,
                            account_id,
                            address1,
                            address2,
                            city,
                            province,
                            "postalCode",
                            country
                        ) VALUES ($1, false, NULL, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (property_id) DO UPDATE
                        SET 
                            use_account_billing = false,
                            account_id = NULL,
                            address1 = $2,
                            address2 = $3,
                            city = $4,
                            province = $5,
                            "postalCode" = $6,
                            country = $7`,
                        [
                            propertyId,
                            billingAddress.address.address1,
                            billingAddress.address.address2,
                            billingAddress.address.city,
                            billingAddress.address.province,
                            billingAddress.address.postalCode,
                            billingAddress.address.country
                        ]
                    );
                }
            }

            await AppDataSource.query('COMMIT');

            res.status(201).json({
                message: 'Property assigned successfully'
            });
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error assigning property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to assign property'
        });
    }
};
