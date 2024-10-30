import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const deleteAccount = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Check for jobs in any of the account's properties
        const [jobCount] = await AppDataSource.query(
            `SELECT COUNT(*) as count FROM jobs j
             INNER JOIN properties p ON p.property_id = j.property_id
             INNER JOIN properties_accounts pa ON pa.property_id = p.property_id
             WHERE pa.account_id = $1`,
            [id]
        );

        if (parseInt(jobCount.count) > 0) {
            return res.status(400).json({
                error: 'Account has job data',
                message: 'Cannot delete account with existing job data. Please contact admin to archive this account.',
                canArchive: true
            });
        }

        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Delete property addresses
            await transactionalEntityManager.query(
                `DELETE FROM addresses WHERE address_id IN (
                    SELECT billing_address_id FROM properties p
                    INNER JOIN properties_accounts pa ON pa.property_id = p.property_id
                    WHERE pa.account_id = $1 AND billing_address_id IS NOT NULL
                    UNION
                    SELECT service_address_id FROM properties p
                    INNER JOIN properties_accounts pa ON pa.property_id = p.property_id
                    WHERE pa.account_id = $1 AND service_address_id IS NOT NULL
                )`,
                [id]
            );

            // Delete properties (will cascade to properties_accounts)
            await transactionalEntityManager.query(
                `DELETE FROM properties WHERE property_id IN (
                    SELECT property_id FROM properties_accounts
                    WHERE account_id = $1
                )`,
                [id]
            );

            // Delete account billing address
            await transactionalEntityManager.query(
                `DELETE FROM addresses WHERE address_id IN (
                    SELECT billing_address_id FROM accounts 
                    WHERE account_id = $1 AND billing_address_id IS NOT NULL
                )`,
                [id]
            );

            // Delete account (will cascade to users_accounts)
            await transactionalEntityManager.query(
                `DELETE FROM accounts WHERE account_id = $1`,
                [id]
            );
        });

        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete account'
        });
    }
};

export const archiveAccount = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await AppDataSource.query(
            `UPDATE accounts 
            SET status = 'archived', updated_at = CURRENT_TIMESTAMP
            WHERE account_id = $1`,
            [id]
        );

        res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive account'
        });
    }
};
