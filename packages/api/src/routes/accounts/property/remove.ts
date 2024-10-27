import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

export const removePropertyAssignment = async (req: Request, res: Response) => {
    try {
        const { id, propertyId } = req.params;

        // Start a transaction
        await AppDataSource.query('BEGIN');

        try {
            // Remove assignment
            const result = await AppDataSource.query(
                `DELETE FROM properties_accounts_join
                WHERE account_id = $1 AND property_id = $2`,
                [id, propertyId]
            );

            if (result.rowCount === 0) {
                await AppDataSource.query('ROLLBACK');
                return res.status(404).json({
                    error: 'Not found',
                    message: 'Assignment not found'
                });
            }

            // Remove billing address if using account billing
            await AppDataSource.query(
                `DELETE FROM property_billing_address
                WHERE property_id = $1 AND account_id = $2`,
                [propertyId, id]
            );

            await AppDataSource.query('COMMIT');

            res.json({
                message: 'Assignment removed successfully'
            });
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error removing assignment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to remove assignment'
        });
    }
};
