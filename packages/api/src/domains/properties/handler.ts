import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Property } from './entities/Property';
import { Account } from '../accounts/entities/Account';
import { logger } from '../../utils/logger';

const propertyRepository = AppDataSource.getRepository(Property);
const accountRepository = AppDataSource.getRepository(Account);

// Get property by ID
export async function getProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property with ID: ${id}`);

        const property = await propertyRepository.findOne({
            where: { property_id: id },
            relations: ['serviceAddress', 'accounts']
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        logger.info(`Found property:`, property);
        res.json(property);
    } catch (error) {
        logger.error('Error fetching property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Create new property
export async function createProperty(req: Request, res: Response) {
    try {
        logger.info('Creating new property:', req.body);
        
        // Validate required fields
        const { name, type, account_ids } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property name is required'
            });
        }
        if (!type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property type is required'
            });
        }

        // Create property
        const property = propertyRepository.create({
            ...req.body,
            status: req.body.status || 'Active'
        });

        // Handle account relationships
        if (account_ids?.length) {
            const accounts = await Promise.all(
                account_ids.map(async (id: string) => {
                    const account = await accountRepository.findOne({ 
                        where: { account_id: id }
                    });
                    if (!account) {
                        throw new Error(`Account not found with ID: ${id}`);
                    }
                    return account;
                })
            );
            property.accounts = accounts;
        }

        const savedProperty = await propertyRepository.save(property);
        logger.info('Property created:', savedProperty);
        res.status(201).json(savedProperty);
    } catch (error) {
        logger.error('Error creating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update property
export async function updateProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Updating property ${id}:`, req.body);

        const property = await propertyRepository.findOne({
            where: { property_id: id },
            relations: ['accounts']
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        // Validate if fields are being updated
        const { name, type } = req.body;
        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property name cannot be empty'
            });
        }
        if (type !== undefined && !type) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property type cannot be empty'
            });
        }

        // Handle account relationships if being updated
        if (req.body.account_ids) {
            const accounts = await Promise.all(
                req.body.account_ids.map(async (accountId: string) => {
                    const account = await accountRepository.findOne({ 
                        where: { account_id: accountId }
                    });
                    if (!account) {
                        throw new Error(`Account not found with ID: ${accountId}`);
                    }
                    return account;
                })
            );
            property.accounts = accounts;
        }

        propertyRepository.merge(property, req.body);
        const updatedProperty = await propertyRepository.save(property);

        logger.info('Property updated:', updatedProperty);
        res.json(updatedProperty);
    } catch (error) {
        logger.error('Error updating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Archive property
export async function archiveProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving property: ${id}`);

        const property = await propertyRepository.findOne({
            where: { property_id: id }
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        property.status = 'Archived';
        const archivedProperty = await propertyRepository.save(property);

        logger.info('Property archived:', archivedProperty);
        res.json(archivedProperty);
    } catch (error) {
        logger.error('Error archiving property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
