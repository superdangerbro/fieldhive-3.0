import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { DELETE_JOB_QUERY } from '../queries';

/**
 * Delete a job
 * Handles:
 * - Job deletion
 * - Response formatting
 * - Error handling
 */
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        logger.info('Deleting job:', id);

        const result = await AppDataSource.query(
            DELETE_JOB_QUERY,
            [id]
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Job not found'
            });
        }

        logger.info('Successfully deleted job:', id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting job:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete job',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
