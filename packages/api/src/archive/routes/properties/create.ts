import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { CreatePropertyDto } from '@fieldhive/shared';
import { Property } from '../../entities/Property';
import { Address } from '../../entities/Address';
import { Account } from '../../entities/Account';

interface PostgresError extends Error {
    code?: string;
    detail?: string;
    query?: string;
}

export const createProperty = async (req: Request, res: Response) => {
    try {
        const { 
            name,
            property_type,
            location,
            boundary,
            billing_address,
            service_address,
            account_id
        } = req.body as CreatePropertyDto;

        logger.info('Creating property with data:', JSON.stringify({
            name,
            property_type,
            location,
            boundary,
            service_address,
            billing_address,
            account_id
        }, null, 2));

        // Validate required fields
        if (!service_address) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Service address is required'
            });
        }

        if (!account_id || !location) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Account ID and location are required'
            });
        }

        // Validate GeoJSON format
        if (!location.type || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Invalid location format. Expected GeoJSON Point with [longitude, latitude] coordinates.'
            });
        }

        try {
            const result = await AppDataSource.transaction(async (transactionalEntityManager) => {
                // Set timezone for this transaction
                await transactionalEntityManager.query(`SET TIME ZONE 'America/Vancouver'`);

                // Create service address
                logger.info('Creating service address...');
                const newServiceAddress = new Address();
                newServiceAddress.address1 = service_address.address1;
                newServiceAddress.address2 = service_address.address2 || undefined;
                newServiceAddress.city = service_address.city;
                newServiceAddress.province = service_address.province;
                newServiceAddress.postal_code = service_address.postal_code;
                newServiceAddress.country = service_address.country || 'Canada';
                const savedServiceAddress = await transactionalEntityManager.save(newServiceAddress);
                logger.info('Service address created:', savedServiceAddress.address_id);

                // Create billing address if provided, otherwise use service address
                let savedBillingAddress;
                if (billing_address) {
                    logger.info('Creating billing address...');
                    const newBillingAddress = new Address();
                    newBillingAddress.address1 = billing_address.address1;
                    newBillingAddress.address2 = billing_address.address2 || undefined;
                    newBillingAddress.city = billing_address.city;
                    newBillingAddress.province = billing_address.province;
                    newBillingAddress.postal_code = billing_address.postal_code;
                    newBillingAddress.country = billing_address.country || 'Canada';
                    savedBillingAddress = await transactionalEntityManager.save(newBillingAddress);
                    logger.info('Billing address created:', savedBillingAddress.address_id);
                } else {
                    savedBillingAddress = savedServiceAddress;
                    logger.info('Using service address as billing address');
                }

                // Find the account
                const account = await transactionalEntityManager.findOne(Account, {
                    where: { id: account_id }
                });

                if (!account) {
                    throw new Error(`Account not found with ID: ${account_id}`);
                }

                // Create property
                logger.info('Creating property...');
                const property = new Property();
                property.name = name || service_address.address1;
                property.property_type = property_type || 'residential';
                property.location = location;
                property.boundary = boundary;
                property.billing_address = savedBillingAddress;
                property.service_address = savedServiceAddress;
                property.status = 'active';
                property.accounts = [account];

                const savedProperty = await transactionalEntityManager.save(property);
                logger.info('Property created:', savedProperty.property_id);

                // Fetch full property details
                logger.info('Fetching full property details...');
                const fullProperty = await transactionalEntityManager
                    .createQueryBuilder(Property, 'p')
                    .leftJoinAndSelect('p.billing_address', 'ba')
                    .leftJoinAndSelect('p.service_address', 'sa')
                    .leftJoinAndSelect('p.accounts', 'a')
                    .where('p.property_id = :id', { id: savedProperty.property_id })
                    .getOne();

                return fullProperty;
            });

            res.status(201).json(result);
        } catch (error) {
            const txError = error as PostgresError;
            logger.error('Transaction error:', txError);
            logger.error('Transaction error details:', {
                message: txError.message,
                stack: txError.stack,
                code: txError.code,
                detail: txError.detail,
                query: txError.query
            });
            throw txError;
        }
    } catch (error) {
        logger.error('Error creating property:', error);
        const err = error as PostgresError;
        res.status(500).json({
            error: 'Internal server error',
            message: err.message,
            details: {
                stack: err.stack,
                code: err.code,
                detail: err.detail,
                query: err.query
            }
        });
    }
};
