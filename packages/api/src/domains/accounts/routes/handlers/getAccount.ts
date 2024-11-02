import { Request, Response } from 'express';
import { AccountService } from '../../services/accountService';
import { logger } from '../../../../core/utils/logger';

const accountService = new AccountService();

export async function getAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting account with ID: ${id}`);

        const account = await accountService.findById(id);

        if (!account) {
            logger.warn(`Account not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        logger.info(`Found account:`, account);
        res.json(account);
    } catch (error) {
        logger.error('Error fetching account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
