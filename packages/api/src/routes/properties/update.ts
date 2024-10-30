import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';
import { UpdatePropertyDto } from '@fieldhive/shared';

export const updateProperty = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { 
        name, 
        status,
        billing_address,
        service_address
    } = req.body as UpdatePropertyDto;

    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            // Update billing address if provided
            if (billing_address) {
                await transactionalEntityManager.query(
                    `UPDATE addresses 
                    SET address1 = $1, address2 = $2, city = $3, province = $4, postal_code = $5, country = $6
                    WHERE address_id = (SELECT billing_address_id FROM properties WHERE property_id = $7)`,
                    [
                        billing_address.address1,
                        billing_address.address2 || null,
                        billing_address.city,
                        billing_address.province,
                        billing_address.postal_code,
                        billing_address.country || 'Canada',
                        id
                    ]
                );
            }

            // Update service address if provided
            if (service_address) {
                await transactionalEntityManager.query(
                    `UPDATE addresses 
                    SET address1 = $1, address2 = $2, city = $3, province = $4, postal_code = $5, country = $6
                    WHERE address_id = (SELECT service_address_id FROM properties WHERE property_id = $7)`,
                    [
                        service_address.address1,
                        service_address.address2 || null,
                        service_address.city,
                        service_address.province,
                        service_address.postal_code,
                        service_address.country || 'Canada',
                        id
                    ]
                );
            }

            // Update property
            await transactionalEntityManager.query(
                `UPDATE properties 
                SET name = COALESCE($1, name), 
                    status = COALESCE($2, status),
                    updated_at = NOW()
                WHERE property_id = $3`,
                [name, status, id]
            );

            // Get updated property with addresses
            const [updatedProperty] = await transactionalEntityManager.query(
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
                [id]
            );

            res.json(updatedProperty);
        });
    } catch (error) {
        logger.error('Error updating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property'
        });
    }
};
