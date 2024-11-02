import { Request, Response } from 'express';
import { AccountService } from '../../services/accountService';
import { CreateAccountDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const accountService = new AccountService();

export async function createAccount(req: Request, res: Response) {
    try {
        const accountData: CreateAccountDto = req.body;
        logger.info('Creating new account:', accountData);

        const account = await accountService.create(accountData);
        
        logger.info('Account created successfully:', account);
        res.status(201).json(account);
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
