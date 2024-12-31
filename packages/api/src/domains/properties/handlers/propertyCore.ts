import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Property } from '../entities/Property';
import { Account } from '../../accounts/entities/Account';
import { Address } from '../../addresses/entities/Address';
import { logger } from '../../../utils/logger';
import { repositories } from './repositories';
import { In } from 'typeorm';

interface CreatePropertyBody {
    name: string;
    type: string;
    status?: string;
    account_id: string;
    service_address: Partial<Address>;
    billing_address?: Partial<Address>;
    location?: unknown;
    boundary?: unknown;
}

interface UpdatePropertyBody {
    name?: string;
    type?: string;
    status?: string;
    service_address?: Partial<Address>;
    billing_address?: Partial<Address>;
    account_ids?: string[];
    location?: unknown;
    boundary?: unknown;
}

interface PropertyQueryParams {
    offset?: string;
    search?: string;
    accountId?: string;
    type?: string;
    status?: string;
}

interface PropertyParams {
    id: string;
}

// Get all properties with pagination and filtering
export async function getProperties(
    req: Request<Record<string, never>, unknown, Record<string, never>, PropertyQueryParams>,
    res: Response
) {
    try {
        const { 
            offset = '0',
            search,
            accountId,
            type,
            status
        } = req.query;

        logger.info('Getting properties with params:', { offset, search, accountId, type, status });

        const queryBuilder = repositories.propertyRepository
            .createQueryBuilder('property')
            .leftJoinAndSelect('property.serviceAddress', 'serviceAddress')
            .leftJoinAndSelect('property.billingAddress', 'billingAddress')
            .leftJoinAndSelect('property.accounts', 'accounts')
            .orderBy('property.name', 'ASC');

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(LOWER(property.name) LIKE LOWER(:search) OR CAST(property.property_id AS TEXT) LIKE LOWER(:search))',
                { search: `%${search}%` }
            );
        }

        // Apply account filter
        if (accountId) {
            queryBuilder.andWhere('accounts.account_id = :accountId', { accountId });
        }

        // Apply type filter
        if (type) {
            queryBuilder.andWhere('property.property_type = :type', { type });
        }

        // Apply status filter
        if (status) {
            queryBuilder.andWhere('property.status = :status', { status });
        }

        // Get total count
        const total = await queryBuilder.getCount();

        // Get paginated results
        const properties = await queryBuilder
            .skip(Number(offset))
            .getMany();

        res.json({
            total,
            properties
        });
    } catch (error) {
        logger.error('Error in getProperties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}

// Get property by ID
export async function getProperty(
    req: Request<PropertyParams>,
    res: Response
) {
    try {
        const { id } = req.params;
        logger.info(`Getting property with ID: ${id}`);

        const property = await repositories.propertyRepository.findOne({
            where: { property_id: id },
            relations: ['serviceAddress', 'billingAddress', 'accounts']
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        logger.info('Found property:', property);
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
export async function createProperty(
    req: Request<Record<string, never>, unknown, CreatePropertyBody>,
    res: Response
) {
    try {
        logger.info('Creating new property:', req.body);
        
        // Validate required fields
        const { name, type, account_id, service_address, billing_address } = req.body;
        if (!name?.trim()) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Property name is required'
            });
            return;
        }
        if (!type) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Property type is required'
            });
            return;
        }
        if (!service_address) {
            res.status(400).json({
                error: 'Validation failed',
                message: 'Service address is required'
            });
            return;
        }

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create service address
            const serviceAddress = queryRunner.manager.create(Address, service_address);
            const savedServiceAddress = await queryRunner.manager.save(serviceAddress);
            logger.info('Service address created:', savedServiceAddress);

            // Create billing address if different from service address
            let savedBillingAddress;
            if (billing_address) {
                const billingAddress = queryRunner.manager.create(Address, billing_address);
                savedBillingAddress = await queryRunner.manager.save(billingAddress);
                logger.info('Billing address created:', savedBillingAddress);
            }

            // Get account
            const account = await queryRunner.manager.findOne(Account, {
                where: { account_id }
            });
            if (!account) {
                throw new Error(`Account not found with ID: ${account_id}`);
            }

            // Create property with address references
            const property = queryRunner.manager.create(Property, {
                name,
                type,
                status: req.body.status || 'active',
                service_address_id: savedServiceAddress.address_id,
                billing_address_id: savedBillingAddress?.address_id || savedServiceAddress.address_id,
                serviceAddress: savedServiceAddress,
                billingAddress: savedBillingAddress || savedServiceAddress,
                location: req.body.location,
                boundary: req.body.boundary,
                accounts: [account]
            });

            const savedProperty = await queryRunner.manager.save(property);
            logger.info('Property created:', savedProperty);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Fetch complete property with relations
            const completeProperty = await repositories.propertyRepository.findOne({
                where: { property_id: savedProperty.property_id },
                relations: ['serviceAddress', 'billingAddress', 'accounts']
            });

            res.status(201).json(completeProperty);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
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
export async function updateProperty(
    req: Request<PropertyParams, unknown, UpdatePropertyBody>,
    res: Response
) {
    try {
        const { id } = req.params;
        logger.info(`Updating property ${id}:`, req.body);

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Load property with all relations
            const property = await queryRunner.manager.findOne(Property, {
                where: { property_id: id },
                relations: ['serviceAddress', 'billingAddress', 'accounts']
            });

            if (!property) {
                logger.warn(`Property not found with ID: ${id}`);
                res.status(404).json({
                    error: 'Not found',
                    message: 'Property not found'
                });
                return;
            }

            // Validate if fields are being updated
            const { name, type, service_address, billing_address, account_ids } = req.body;
            if (name !== undefined && !name.trim()) {
                res.status(400).json({
                    error: 'Validation failed',
                    message: 'Property name cannot be empty'
                });
                return;
            }
            if (type !== undefined && !type) {
                res.status(400).json({
                    error: 'Validation failed',
                    message: 'Property type cannot be empty'
                });
                return;
            }

            // Update service address if provided
            if (service_address) {
                if (property.serviceAddress) {
                    // Update existing service address
                    queryRunner.manager.merge(Address, property.serviceAddress, service_address);
                    const updatedServiceAddress = await queryRunner.manager.save(property.serviceAddress);
                    property.serviceAddress = updatedServiceAddress;
                } else {
                    // Create new service address
                    const newServiceAddress = queryRunner.manager.create(Address, service_address);
                    const savedServiceAddress = await queryRunner.manager.save(newServiceAddress);
                    property.service_address_id = savedServiceAddress.address_id;
                    property.serviceAddress = savedServiceAddress;
                }
            }

            // Update billing address if provided
            if (billing_address) {
                if (property.billingAddress && property.billing_address_id !== property.service_address_id) {
                    // Update existing billing address if it's different from service address
                    queryRunner.manager.merge(Address, property.billingAddress, billing_address);
                    const updatedBillingAddress = await queryRunner.manager.save(property.billingAddress);
                    property.billingAddress = updatedBillingAddress;
                } else {
                    // Create new billing address
                    const newBillingAddress = queryRunner.manager.create(Address, billing_address);
                    const savedBillingAddress = await queryRunner.manager.save(newBillingAddress);
                    property.billing_address_id = savedBillingAddress.address_id;
                    property.billingAddress = savedBillingAddress;
                }
            }

            // Handle account relationships if being updated
            if (account_ids) {
                // Load all accounts first
                const accounts = await queryRunner.manager.find(Account, {
                    where: { account_id: In(account_ids) }
                });

                if (accounts.length !== account_ids.length) {
                    const foundIds = accounts.map((a: Account) => a.account_id);
                    const missingIds = account_ids.filter((id: string) => !foundIds.includes(id));
                    throw new Error(`Some accounts not found: ${missingIds.join(', ')}`);
                }

                // Update the accounts array directly
                property.accounts = accounts;
            }

            // Update other property fields
            queryRunner.manager.merge(Property, property, {
                name: req.body.name,
                type: req.body.type,
                status: req.body.status,
                location: req.body.location,
                boundary: req.body.boundary
            });

            // Save the updated property
            const updatedProperty = await queryRunner.manager.save(property);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Fetch complete property with relations
            const completeProperty = await repositories.propertyRepository.findOne({
                where: { property_id: updatedProperty.property_id },
                relations: ['serviceAddress', 'billingAddress', 'accounts']
            });

            logger.info('Property updated:', completeProperty);
            res.json(completeProperty);
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    } catch (error) {
        logger.error('Error updating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Delete property
export async function deleteProperty(
    req: Request<PropertyParams>,
    res: Response
) {
    try {
        const { id } = req.params;
        logger.info(`Deleting property: ${id}`);

        const property = await repositories.propertyRepository.findOne({
            where: { property_id: id },
            relations: ['serviceAddress', 'billingAddress', 'accounts']
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
            return;
        }

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Store addresses for deletion
            const serviceAddress = property.serviceAddress;
            const billingAddress = property.billingAddress;

            // Remove relationships first
            property.accounts = [];
            property.serviceAddress = null;
            property.billingAddress = null;
            await queryRunner.manager.save(property);

            // Delete the property
            await queryRunner.manager.remove(property);

            // Delete the addresses if they exist
            if (serviceAddress) {
                await queryRunner.manager.remove(serviceAddress);
            }
            if (billingAddress && billingAddress.address_id !== serviceAddress?.address_id) {
                await queryRunner.manager.remove(billingAddress);
            }

            // Commit transaction
            await queryRunner.commitTransaction();

            logger.info('Property and associated addresses deleted successfully');
            res.json({
                success: true,
                message: 'Property deleted successfully'
            });
        } catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Release query runner
            await queryRunner.release();
        }
    } catch (error) {
        logger.error('Error deleting property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
