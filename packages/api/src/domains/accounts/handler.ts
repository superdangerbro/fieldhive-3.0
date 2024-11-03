import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Account } from './entities/Account';
import { logger } from '../../utils/logger';
import { Repository } from 'typeorm';

const accountRepository: Repository<Account> = AppDataSource.getRepository(Account);

// Get accounts with filters
export async function getAccounts(req: Request, res: Response) {
    try {
        const { type, status, search, limit, offset } = req.query;
        
        const query = accountRepository
            .createQueryBuilder('accounts')
            .leftJoinAndSelect('accounts.billingAddress', 'billingAddress')
            .leftJoinAndSelect('accounts.properties', 'properties')
            .leftJoinAndSelect('accounts.users', 'users');

        // Add filters
        if (type) {
            query.andWhere('accounts.type = :type', { type });
        }
        if (status) {
            query.andWhere('accounts.status = :status', { status });
        }
        if (search) {
            // Check if it's a UUID (account_id)
            if (String(search).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                query.andWhere('accounts.account_id = :id', { id: search });
            } else {
                query.andWhere('accounts.name ILIKE :name', { name: `%${search}%` });
            }
        }

        // Get total count
        const total = await query.getCount();

        // Apply pagination
        if (limit !== undefined) {
            query.take(Number(limit));
        }
        if (offset !== undefined) {
            query.skip(Number(offset));
        }

        // Get accounts
        const accounts = await query
            .orderBy('accounts.name', 'ASC')
            .getMany();

        res.json({ accounts, total });
    } catch (error) {
        logger.error('Error getting accounts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get accounts',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Get single account
export async function getAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const account = await accountRepository.findOne({
            where: { account_id: id },
            relations: ['billingAddress', 'properties', 'users']
        });

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        res.json(account);
    } catch (error) {
        logger.error('Error getting account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Create account
export async function createAccount(req: Request, res: Response) {
    try {
        // Validate required fields
        const { name, type } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account name is required'
            });
        }
        if (!type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account type is required'
            });
        }

        // Create account with timestamps
        const now = new Date();
        const newAccount = accountRepository.create({
            ...req.body,
            status: 'Active',
            created_at: now,
            updated_at: now
        });

        const savedAccount = await accountRepository.save(newAccount);

        // Return account with relations
        const accountWithRelations = await accountRepository.findOne({
            where: { account_id: savedAccount.account_id },
            relations: ['billingAddress', 'properties', 'users']
        });

        if (!accountWithRelations) {
            throw new Error('Failed to retrieve saved account');
        }

        res.status(201).json(accountWithRelations);
    } catch (error) {
        logger.error('Error creating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update account
export async function updateAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const account = await accountRepository.findOne({
            where: { account_id: id },
            relations: ['billingAddress', 'properties', 'users']
        });

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        // Validate fields if they're being updated
        const { name, type } = req.body;
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account name cannot be empty'
            });
        }
        if (type !== undefined && !type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account type cannot be empty'
            });
        }

        // Update account with new timestamp
        accountRepository.merge(account, {
            ...req.body,
            updated_at: new Date()
        });
        const updatedAccount = await accountRepository.save(account);

        res.json(updatedAccount);
    } catch (error) {
        logger.error('Error updating account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Delete account
export async function deleteAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const account = await accountRepository.findOne({
            where: { account_id: id },
            relations: ['billingAddress', 'properties', 'users']
        });

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        // Remove relationships first
        account.properties = [];
        account.users = [];
        await accountRepository.save(account);

        // Then delete the account
        await accountRepository.remove(account);

        // Send a simple success response
        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Archive account
export async function archiveAccount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const account = await accountRepository.findOne({
            where: { account_id: id }
        });

        if (!account) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Account not found'
            });
        }

        account.status = 'Archived';
        account.updated_at = new Date();
        const archivedAccount = await accountRepository.save(account);

        res.json(archivedAccount);
    } catch (error) {
        logger.error('Error archiving account:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive account',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
