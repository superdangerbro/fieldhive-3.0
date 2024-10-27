import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { UpdatePropertyAssignmentDto } from '@fieldhive/shared';

export const updatePropertyAssignment = async (req: Request, res: Response) => {
    try {
        const { id, propertyId } = req.params;
        const { role, billingAddress } = req.body as UpdatePropertyAssignmentDto;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Update assignment if role provided
            if (role) {
                const result = await AppDataSource.query(
                    `UPDATE properties_accounts_join
                    SET role = $1
                    WHERE account_id = $2 AND property_id = $3`,
                    [role, id, propertyId]
                );

                if (result.rowCount === 0) {
                    await AppDataSource.query('ROLLBACK');
                    return res.status(404).json({
                        error: 'Not found',
                        message: 'Assignment not found'
                    });
                }
            }

            // Update billing address if provided
            if (billingAddress) {
                if (billingAddress.useAccountBilling) {
                    await AppDataSource.query(
                        `UPDATE property_billing_address
                        SET 
                            use_account_billing = true,
                            account_id = $1,
                            address1 = NULL,
                            address2 = NULL,
                            city = NULL,
                            province = NULL,
                            "postalCode" = NULL,
                            country = NULL
                        WHERE property_id = $2`,
                        [id, propertyId]
                    );
                } else if (billingAddress.address) {
                    await AppDataSource.query(
                        `UPDATE property_billing_address
                        SET 
                            use_account_billing = false,
                            account_id = NULL,
                            address1 = $1,
                            address2 = $2,
                            city = $3,
                            province = $4,
                            "postalCode" = $5,
                            country = $6
                        WHERE property_id = $7`,
                        [
                            billingAddress.address.address1,
                            billingAddress.address.address2,
                            billingAddress.address.city,
                            billingAddress.address.province,
                            billingAddress.address.postalCode,
                            billingAddress.address.country,
                            propertyId
                        ]
                    );
                }
            }

            await AppDataSource.query('COMMIT');

            res.json({
                message: 'Assignment updated successfully'
            });
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error updating assignment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update assignment'
        });
    }
};
