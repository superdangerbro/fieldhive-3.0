import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const listProperties = async (req: Request, res: Response) => {
    try {
        const { limit = 25, offset = 0, search = '', accountId } = req.query;

        // First, get the base property data
        const baseQuery = AppDataSource
            .createQueryBuilder()
            .select('p.*')
            .from('properties', 'p')
            .leftJoin('addresses', 'ba', 'ba.address_id = p.billing_address_id')
            .leftJoin('addresses', 'sa', 'sa.address_id = p.service_address_id');

        if (accountId) {
            baseQuery
                .innerJoin('properties_accounts', 'pa', 'pa.property_id = p.property_id')
                .andWhere('pa.account_id = :accountId', { accountId });
        }

        if (search) {
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search as string);
            
            if (isUUID) {
                baseQuery.andWhere('p.property_id = :propertyId', { propertyId: search });
            } else {
                baseQuery.andWhere(
                    'p.name ILIKE :search OR ba.address1 ILIKE :search OR sa.address1 ILIKE :search',
                    { search: `%${search}%` }
                );
            }
        }

        try {
            // Get the properties with basic data
            const [properties, total] = await Promise.all([
                baseQuery
                    .offset(Number(offset))
                    .limit(Number(limit))
                    .orderBy('p.name', 'ASC')
                    .getRawMany(),
                baseQuery.getCount()
            ]);

            // For each property, get the additional data
            const enrichedProperties = await Promise.all(properties.map(async (property) => {
                try {
                    // Get addresses with all fields properly aliased
                    const [addresses] = await AppDataSource.query(`
                        SELECT 
                            ba.address_id as billing_address_id,
                            ba.address1 as billing_address1,
                            ba.address2 as billing_address2,
                            ba.city as billing_city,
                            ba.province as billing_province,
                            ba.postal_code as billing_postal_code,
                            ba.country as billing_country,
                            sa.address_id as service_address_id,
                            sa.address1 as service_address1,
                            sa.address2 as service_address2,
                            sa.city as service_city,
                            sa.province as service_province,
                            sa.postal_code as service_postal_code,
                            sa.country as service_country
                        FROM properties p
                        LEFT JOIN addresses ba ON ba.address_id = p.billing_address_id
                        LEFT JOIN addresses sa ON sa.address_id = p.service_address_id
                        WHERE p.property_id = $1
                    `, [property.property_id]);

                    // Get accounts
                    const accounts = await AppDataSource.query(`
                        SELECT a.account_id, a.name
                        FROM properties_accounts pa
                        JOIN accounts a ON a.account_id = pa.account_id
                        WHERE pa.property_id = $1
                    `, [property.property_id]);

                    // Get geometry data
                    const [geometry] = await AppDataSource.query(`
                        SELECT 
                            ST_AsGeoJSON(location)::json as location,
                            ST_AsGeoJSON(boundary)::json as boundary
                        FROM properties
                        WHERE property_id = $1
                    `, [property.property_id]);

                    return {
                        ...property,
                        location: geometry?.location || null,
                        boundary: geometry?.boundary || null,
                        billing_address: addresses?.billing_address_id ? {
                            address_id: addresses.billing_address_id,
                            address1: addresses.billing_address1,
                            address2: addresses.billing_address2,
                            city: addresses.billing_city,
                            province: addresses.billing_province,
                            postal_code: addresses.billing_postal_code,
                            country: addresses.billing_country
                        } : null,
                        service_address: addresses?.service_address_id ? {
                            address_id: addresses.service_address_id,
                            address1: addresses.service_address1,
                            address2: addresses.service_address2,
                            city: addresses.service_city,
                            province: addresses.service_province,
                            postal_code: addresses.service_postal_code,
                            country: addresses.service_country
                        } : null,
                        accounts: accounts || []
                    };
                } catch (error) {
                    logger.error('Error enriching property:', {
                        propertyId: property.property_id,
                        error
                    });
                    return property;
                }
            }));

            // Log the first property for debugging
            if (enrichedProperties.length > 0) {
                logger.info('First property data:', {
                    id: enrichedProperties[0].property_id,
                    addresses: {
                        billing: enrichedProperties[0].billing_address,
                        service: enrichedProperties[0].service_address
                    }
                });
            }

            res.json({
                properties: enrichedProperties,
                total,
                limit: Number(limit),
                offset: Number(offset)
            });
        } catch (error) {
            logger.error('Error executing property queries:', error);
            throw error;
        }
    } catch (error) {
        logger.error('Error listing properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to list properties',
            details: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : String(error)
        });
    }
};
