import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { CreatePropertyDto } from '@fieldhive/shared';

export const createProperty = async (req: Request, res: Response) => {
    try {
        const { 
            name, 
            billing_address,
            service_address
        } = req.body as CreatePropertyDto;

        if (!name) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Name is required'
            });
        }

        await AppDataSource.transaction(async (transactionalEntityManager) => {
            let billing_address_id = null;
            let service_address_id = null;

            // Create billing address if provided
            if (billing_address) {
                const [newBillingAddress] = await transactionalEntityManager.query(
                    `INSERT INTO addresses (
                        address1, address2, city, province, postal_code, country
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING address_id`,
                    [
                        billing_address.address1,
                        billing_address.address2 || null,
                        billing_address.city,
                        billing_address.province,
                        billing_address.postal_code,
                        billing_address.country || 'Canada'
                    ]
                );
                billing_address_id = newBillingAddress.address_id;
            }

            // Create service address if provided
            if (service_address) {
                const [newServiceAddress] = await transactionalEntityManager.query(
                    `INSERT INTO addresses (
                        address1, address2, city, province, postal_code, country
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING address_id`,
                    [
                        service_address.address1,
                        service_address.address2 || null,
                        service_address.city,
                        service_address.province,
                        service_address.postal_code,
                        service_address.country || 'Canada'
                    ]
                );
                service_address_id = newServiceAddress.address_id;
            }

            // Create property
            const [property] = await transactionalEntityManager.query(
                `INSERT INTO properties (
                    name, billing_address_id, service_address_id
                ) VALUES ($1, $2, $3)
                RETURNING property_id`,
                [name, billing_address_id, service_address_id]
            );

            // Get full property details with addresses
            const [fullProperty] = await transactionalEntityManager.query(
                `SELECT 
                    p.*,
                    json_build_object(
                        'address_id', ba.address_id,
                        'address1', ba.address1,
                        'address2', ba.address2,
                        'city', ba.city,
                        'province', ba.province,
                        'postal_code', ba.postal_code,
                        'country', ba.country
                    ) AS billing_address,
                    json_build_object(
                        'address_id', sa.address_id,
                        'address1', sa.address1,
                        'address2', sa.address2,
                        'city', sa.city,
                        'province', sa.province,
                        'postal_code', sa.postal_code,
                        'country', sa.country
                    ) AS service_address
                FROM properties p
                LEFT JOIN addresses ba ON ba.address_id = p.billing_address_id
                LEFT JOIN addresses sa ON sa.address_id = p.service_address_id
                WHERE p.property_id = $1`,
                [property.property_id]
            );

            res.status(201).json(fullProperty);
        });
    } catch (error) {
        logger.error('Error creating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create property'
        });
    }
};
