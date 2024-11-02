import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const getPropertyAddresses = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        logger.info(`Getting addresses for property: ${id}`);

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
        `, [id]);

        if (!addresses) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const response = {
            billing_address: addresses.billing_address_id ? {
                address_id: addresses.billing_address_id,
                address1: addresses.billing_address1,
                address2: addresses.billing_address2,
                city: addresses.billing_city,
                province: addresses.billing_province,
                postal_code: addresses.billing_postal_code,
                country: addresses.billing_country
            } : null,
            service_address: addresses.service_address_id ? {
                address_id: addresses.service_address_id,
                address1: addresses.service_address1,
                address2: addresses.service_address2,
                city: addresses.service_city,
                province: addresses.service_province,
                postal_code: addresses.service_postal_code,
                country: addresses.service_country
            } : null
        };

        res.json(response);
    } catch (error) {
        logger.error('Error fetching property addresses:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property addresses',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
