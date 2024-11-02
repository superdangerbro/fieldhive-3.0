import { Request, Response } from 'express';
import { AccountService } from '../../services/accountService';
import { UpdateAccountDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const accountService = new AccountService();

export async function updateAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const accountData: UpdateAccountDto = req.body;
        logger.info(`Updating account ${id}:`, accountData);

        const account = await accountService.update(id, accountData);

        if (!account) {
            logger.warn(`Account not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        logger.info('Account updated successfully:', account);
        res.json(account);
    } catch (error) {
        logger.error('Error updating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
