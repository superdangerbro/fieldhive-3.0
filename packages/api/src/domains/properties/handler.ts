import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { Property } from './entities/Property';
import { Account } from '../accounts/entities/Account';
import { Address } from '../addresses/entities/Address';
import { logger } from '../../utils/logger';
import { In } from 'typeorm';

const propertyRepository = AppDataSource.getRepository(Property);
const accountRepository = AppDataSource.getRepository(Account);
const addressRepository = AppDataSource.getRepository(Address);

// Get all properties with pagination and filtering
export async function getProperties(req: Request, res: Response) {
    try {
        const { 
            limit = 25, 
            offset = 0,
            search,
            accountId
        } = req.query;

        logger.info('Getting properties with params:', { limit, offset, search, accountId });

        const queryBuilder = propertyRepository
            .createQueryBuilder('property')
            .leftJoinAndSelect('property.serviceAddress', 'serviceAddress')
            .leftJoinAndSelect('property.billingAddress', 'billingAddress')
            .leftJoinAndSelect('property.accounts', 'accounts')
            .orderBy('property.name', 'ASC');

        // Apply search filter
        if (search) {
            queryBuilder.andWhere('property.name ILIKE :search', { 
                search: `%${search}%` 
            });
        }

        // Filter by account
        if (accountId) {
            queryBuilder.andWhere('accounts.account_id = :accountId', { accountId });
        }

        // Apply pagination
        const [properties, total] = await queryBuilder
            .skip(Number(offset))
            .take(Number(limit))
            .getManyAndCount();

        logger.info(`Found ${properties.length} properties`);
        res.json({
            properties,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error) {
        logger.error('Error fetching properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch properties',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Get property by ID
export async function getProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property with ID: ${id}`);

        const property = await propertyRepository.findOne({
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
        const { name, type, account_id, service_address, billing_address } = req.body;
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
        if (!service_address) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Service address is required'
            });
        }

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create service address
            const serviceAddress = await queryRunner.manager.save(Address, service_address);
            logger.info('Service address created:', serviceAddress);

            // Create billing address if different from service address
            let billingAddress;
            if (billing_address) {
                billingAddress = await queryRunner.manager.save(Address, billing_address);
                logger.info('Billing address created:', billingAddress);
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
                status: req.body.status || 'Active',
                service_address_id: serviceAddress.address_id,
                billing_address_id: billingAddress?.address_id || serviceAddress.address_id,
                location: req.body.location,
                boundary: req.body.boundary,
                accounts: [account]
            });

            const savedProperty = await queryRunner.manager.save(property);
            logger.info('Property created:', savedProperty);

            // Commit transaction
            await queryRunner.commitTransaction();

            // Fetch complete property with relations
            const completeProperty = await propertyRepository.findOne({
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

// Delete property
export async function deleteProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Deleting property: ${id}`);

        const property = await propertyRepository.findOne({
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

// Bulk delete properties
export async function bulkDeleteProperties(req: Request, res: Response) {
    try {
        const { propertyIds } = req.body;

        if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Property IDs array is required and must not be empty'
            });
        }

        logger.info(`Bulk deleting properties:`, propertyIds);

        // Fetch all properties with their addresses
        const properties = await propertyRepository.find({
            where: { property_id: In(propertyIds) },
            relations: ['serviceAddress', 'billingAddress', 'accounts']
        });

        if (properties.length === 0) {
            return res.status(404).json({
                error: 'Not found',
                message: 'No properties found with the provided IDs'
            });
        }

        // Start a transaction
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Collect all addresses for deletion
            const addressesToDelete = new Set<Address>();
            for (const property of properties) {
                if (property.serviceAddress) {
                    addressesToDelete.add(property.serviceAddress);
                }
                if (property.billingAddress && property.billingAddress.address_id !== property.serviceAddress?.address_id) {
                    addressesToDelete.add(property.billingAddress);
                }

                // Remove relationships
                property.accounts = [];
                property.serviceAddress = null;
                property.billingAddress = null;
            }

            // Save properties with cleared relationships
            await queryRunner.manager.save(properties);

            // Delete all properties
            await queryRunner.manager.remove(properties);

            // Delete all associated addresses
            if (addressesToDelete.size > 0) {
                await queryRunner.manager.remove(Array.from(addressesToDelete));
            }

            // Commit transaction
            await queryRunner.commitTransaction();

            logger.info(`Successfully deleted ${properties.length} properties and their associated addresses`);
            res.json({
                success: true,
                message: `Successfully deleted ${properties.length} properties`
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
        logger.error('Error bulk deleting properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete properties',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Get property location
export async function getPropertyLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property location for ID: ${id}`);

        // Use raw query to get geometry data in GeoJSON format
        const result = await AppDataSource.query(`
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM properties 
            WHERE property_id = $1
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return raw GeoJSON from database
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error fetching property location:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property location',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update property location
export async function updatePropertyLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;
        logger.info(`Updating property location ${id}:`, coordinates);

        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid coordinates format. Expected [longitude, latitude]'
            });
        }

        // Convert GeoJSON coordinates to PostGIS geometry
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
                WHERE property_id = $3
                RETURNING property_id, location, boundary
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM updated
        `, [coordinates[0], coordinates[1], id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return raw GeoJSON from database
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error updating property location:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property location',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update property boundary
export async function updatePropertyBoundary(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;
        logger.info(`Updating property boundary ${id}:`, coordinates);

        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length < 3 ||
            !coordinates.every(point => Array.isArray(point) && point.length === 2 &&
                typeof point[0] === 'number' && typeof point[1] === 'number')) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid boundary format. Expected array of [longitude, latitude] coordinates'
            });
        }

        // Ensure the polygon is closed
        const closedCoordinates = [...coordinates];
        if (!areCoordinatesEqual(closedCoordinates[0], closedCoordinates[closedCoordinates.length - 1])) {
            closedCoordinates.push(closedCoordinates[0]);
        }

        // Convert GeoJSON coordinates to PostGIS geometry
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET boundary = ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[${
                    closedCoordinates.map((coord: [number, number]) => 
                        `ST_MakePoint(${coord[0]}, ${coord[1]})`
                    ).join(',')
                }])), 4326)
                WHERE property_id = $1
                RETURNING property_id, location, boundary
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM updated
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return raw GeoJSON from database
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error updating property boundary:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property boundary',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Helper function to compare coordinates
function areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}
