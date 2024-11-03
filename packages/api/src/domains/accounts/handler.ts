import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Account } from './entities/Account';
import { logger } from '../../utils/logger';

const accountRepository = AppDataSource.getRepository(Account);

// Get accounts with filters
export async function getAccounts(req: Request, res: Response) {
    try {
        const { type, status, search, limit, offset } = req.query;
        
        const query = accountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.billingAddress', 'billingAddress')
            .leftJoinAndSelect('account.properties', 'properties');

        // Add filters
        if (type) {
            query.andWhere('account.type = :type', { type });
        }
        if (status) {
            query.andWhere('account.status = :status', { status });
        }
        if (search) {
            // Check if it's a UUID (account_id)
            if (String(search).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                logger.info('Searching by account_id:', search);
                query.andWhere('account.account_id = :id', { id: search });
            } else {
                logger.info('Searching by name:', search);
                query.andWhere('account.name ILIKE :name', { name: `%${search}%` });
            }
        }

        // Log the generated SQL
        const sqlQuery = query.getSql();
        const sqlParams = query.getParameters();
        logger.info('Generated SQL:', { sql: sqlQuery, params: sqlParams });

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
            .orderBy('account.name', 'ASC')
            .getMany();

        // Log the results
        logger.info('Query results:', {
            total,
            accountCount: accounts.length,
            firstAccount: accounts[0] ? {
                id: accounts[0].account_id,
                name: accounts[0].name,
                billing_address_id: accounts[0].billing_address_id,
                billingAddress: accounts[0].billingAddress
            } : null
        });

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
            relations: ['billingAddress', 'properties']
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

        // Create account
        const account = accountRepository.create({
            ...req.body,
            status: 'Active'
        });

        await accountRepository.save(account);

        // Return account with relations
        const savedAccount = await accountRepository.findOne({
            where: { account_id: account.account_id },
            relations: ['billingAddress', 'properties']
        });

        res.status(201).json(savedAccount);
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
            relations: ['billingAddress', 'properties']
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

        // Update account
        accountRepository.merge(account, req.body);
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
