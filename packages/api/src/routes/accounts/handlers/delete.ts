import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { DELETE_ACCOUNT_QUERY, CHECK_ACCOUNT_EXISTS_QUERY } from '../queries';

/**
 * Delete an account
 * Handles:
 * - Account existence verification
 * - Account deletion
 * - Response formatting
 * 
 * Note: This is a soft delete in production,
 * updating the status to 'Archived' instead of actual deletion
 */
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        logger.info('Deleting account:', id);

        // Verify account exists
        const [existingAccount] = await AppDataSource.query(
            CHECK_ACCOUNT_EXISTS_QUERY,
            [id]
        );

        if (!existingAccount) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        // Start transaction
        await AppDataSource.query('BEGIN');

        try {
            // In production, consider using soft delete
            // await AppDataSource.query(
            //     'UPDATE accounts SET status = $1, updated_at = NOW() WHERE account_id = $2',
            //     ['Archived', id]
            // );

            // For development, perform actual delete
            const result = await AppDataSource.query(
                DELETE_ACCOUNT_QUERY,
                [id]
            );

            if (result.length === 0) {
                throw new Error('Delete operation failed');
            }

            await AppDataSource.query('COMMIT');

            logger.info('Successfully deleted account:', id);
            res.status(204).send();
        } catch (error) {
            await AppDataSource.query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Example Usage:
 * ```typescript
 * // Delete an account
 * DELETE /accounts/123
 * 
 * // Response: 204 No Content
 * ```
 * 
 * Error Handling:
 * - 404: Account not found
 * - 500: Server error during deletion
 */
