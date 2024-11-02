import { Request, Response } from 'express';
import { AccountService } from '../../services/accountService';
import { logger } from '../../../../core/utils/logger';

const accountService = new AccountService();

export async function archiveAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving account with ID: ${id}`);

        const account = await accountService.archive(id);

        if (!account) {
            logger.warn(`Account not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        logger.info('Account archived successfully:', account);
        res.json(account);
    } catch (error) {
        logger.error('Error archiving account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
