import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Account } from './entities/Account';
import { Property } from '../properties/entities/Property';
import { Job } from '../jobs/entities/Job';
import { logger } from '../../utils/logger';
import { Repository, In, ILike, Not } from 'typeorm';
import { Address } from '../addresses/entities/Address';

const accountRepository: Repository<Account> = AppDataSource.getRepository(Account);
const propertyRepository: Repository<Property> = AppDataSource.getRepository(Property);
const addressRepository: Repository<Address> = AppDataSource.getRepository(Address);

// Get accounts with filters
export async function getAccounts(req: Request, res: Response) {
    try {
        const { type, status, search, limit, offset } = req.query;
        
        const query = accountRepository
            .createQueryBuilder('accounts')
            .leftJoinAndSelect('accounts.billingAddress', 'billingAddress')
            .leftJoinAndSelect('accounts.properties', 'properties')
            .leftJoin('properties.jobs', 'jobs')
            .leftJoinAndSelect('accounts.users', 'users')
            .loadRelationCountAndMap('accounts.jobCount', 'properties.jobs');

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
        
        // Create query builder for more complex joins
        const account = await accountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.billingAddress', 'billingAddress')
            .leftJoinAndSelect('account.properties', 'properties')
            .leftJoin('properties.jobs', 'jobs')
            .leftJoinAndSelect('account.users', 'users')
            .loadRelationCountAndMap('account.jobCount', 'properties.jobs')
            .where('account.account_id = :id', { id })
            .getOne();

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

        // Check for existing account with the same name (case insensitive)
        const existingAccount = await accountRepository.findOne({
            where: { name: ILike(name.trim()) }
        });

        if (existingAccount) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'An account with this name already exists'
            });
        }

        // Create account with timestamps
        const now = new Date();
        const newAccount = accountRepository.create({
            ...req.body,
            name: name.trim(), // Ensure trimmed name is saved
            status: 'Active',
            created_at: now,
            updated_at: now
        });

        // Save the account
        const result = await accountRepository.save(newAccount);
        const savedAccount = Array.isArray(result) ? result[0] : result;

        // Fetch the saved account with relations
        const accountWithRelations = await accountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.billingAddress', 'billingAddress')
            .leftJoinAndSelect('account.properties', 'properties')
            .leftJoin('properties.jobs', 'jobs')
            .leftJoinAndSelect('account.users', 'users')
            .loadRelationCountAndMap('account.jobCount', 'properties.jobs')
            .where('account.account_id = :id', { id: savedAccount.account_id })
            .getOne();

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
        const { name, type, property_ids } = req.body;
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Account name cannot be empty'
                });
            }

            // Check for existing account with the same name (excluding current account)
            const existingAccount = await accountRepository.findOne({
                where: [
                    { 
                        name: ILike(name.trim()),
                        account_id: Not(id)
                    }
                ]
            });

            if (existingAccount) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'An account with this name already exists'
                });
            }
        }
        
        if (type !== undefined && !type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account type cannot be empty'
            });
        }

        // Handle property updates if property_ids are provided
        if (property_ids) {
            logger.info('Updating account properties:', { account_id: id, property_ids });
            
            // Fetch properties by IDs
            const properties = await propertyRepository.findBy({
                property_id: In(property_ids)
            });

            if (properties.length !== property_ids.length) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'One or more property IDs are invalid'
                });
            }

            // Update the account's properties
            account.properties = properties;
            logger.info('Properties fetched and assigned:', { 
                account_id: id, 
                property_count: properties.length,
                properties: properties.map(p => ({ id: p.property_id, name: p.name }))
            });
        }

        // Update account with new timestamp
        accountRepository.merge(account, {
            ...req.body,
            name: name?.trim() || account.name,
            updated_at: new Date()
        });

        // Save the account (this will update the join table)
        await accountRepository.save(account);

        // Fetch the updated account with all relations and job count
        const updatedAccount = await accountRepository
            .createQueryBuilder('account')
            .leftJoinAndSelect('account.billingAddress', 'billingAddress')
            .leftJoinAndSelect('account.properties', 'properties')
            .leftJoin('properties.jobs', 'jobs')
            .leftJoinAndSelect('account.users', 'users')
            .loadRelationCountAndMap('account.jobCount', 'properties.jobs')
            .where('account.account_id = :id', { id })
            .getOne();

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

        // Store billing address for deletion if it exists
        const billingAddress = account.billingAddress;

        // Remove relationships first
        account.properties = [];
        account.users = [];
        account.billingAddress = null;
        await accountRepository.save(account);

        // Delete the account
        await accountRepository.remove(account);

        // Delete the billing address if it exists
        if (billingAddress) {
            await addressRepository.remove(billingAddress);
        }

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

// Bulk delete accounts
export async function bulkDeleteAccounts(req: Request, res: Response) {
    try {
        const { accountIds } = req.body;

        if (!Array.isArray(accountIds) || accountIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Account IDs array is required and must not be empty'
            });
        }

        // Fetch all accounts with their billing addresses
        const accounts = await accountRepository.find({
            where: { account_id: In(accountIds) },
            relations: ['billingAddress', 'properties', 'users']
        });

        if (accounts.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'No accounts found with the provided IDs'
            });
        }

        // Store billing addresses for deletion
        const billingAddresses = accounts
            .map(account => account.billingAddress)
            .filter((address): address is Address => address !== null);

        // Remove relationships for all accounts
        for (const account of accounts) {
            account.properties = [];
            account.users = [];
            account.billingAddress = null;
        }
        await accountRepository.save(accounts);

        // Delete all accounts
        await accountRepository.remove(accounts);

        // Delete all associated billing addresses
        if (billingAddresses.length > 0) {
            await addressRepository.remove(billingAddresses);
        }

        res.json({
            success: true,
            message: `Successfully deleted ${accounts.length} accounts`
        });
    } catch (error) {
        logger.error('Error bulk deleting accounts:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete accounts',
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
        const result = await accountRepository.save(account);
        const archivedAccount = Array.isArray(result) ? result[0] : result;

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
