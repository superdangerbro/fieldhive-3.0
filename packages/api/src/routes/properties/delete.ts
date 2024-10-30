import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const deleteProperty = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Check for jobs
        const [jobCount] = await AppDataSource.query(
            `SELECT COUNT(*) as count FROM jobs WHERE property_id = $1`,
            [id]
        );

        if (parseInt(jobCount.count) > 0) {
            return res.status(400).json({
                error: 'Property has job data',
                message: 'Cannot delete property with existing job data. Please contact admin to archive this property.',
                canArchive: true
            });
        }

        // Check for multiple account owners
        const [accountCount] = await AppDataSource.query(
            `SELECT COUNT(*) as count FROM properties_accounts WHERE property_id = $1`,
            [id]
        );

        if (parseInt(accountCount.count) > 1) {
            return res.status(400).json({
                error: 'Multiple owners',
                message: 'Cannot delete property with multiple account owners.',
                canArchive: true
            });
        }

        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Delete addresses first
            await transactionalEntityManager.query(
                `DELETE FROM addresses WHERE address_id IN (
                    SELECT billing_address_id FROM properties WHERE property_id = $1
                    UNION
                    SELECT service_address_id FROM properties WHERE property_id = $1
                    WHERE billing_address_id IS NOT NULL OR service_address_id IS NOT NULL
                )`,
                [id]
            );

            // Delete property (will cascade to properties_accounts)
            await transactionalEntityManager.query(
                `DELETE FROM properties WHERE property_id = $1`,
                [id]
            );
        });

        res.json({ success: true });
    } catch (error) {
        logger.error('Error deleting property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete property'
        });
    }
};

export const archiveProperty = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await AppDataSource.query(
            `UPDATE properties 
            SET status = 'archived', updated_at = CURRENT_TIMESTAMP
            WHERE property_id = $1`,
            [id]
        );

        res.json({ success: true });
    } catch (error) {
        logger.error('Error archiving property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive property'
        });
    }
};
