import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const listProperties = async (req: Request, res: Response) => {
    try {
        const { limit = 25, offset = 0, search = '', accountId } = req.query;

        const query = AppDataSource
            .createQueryBuilder()
            .select('p.*')
            .addSelect(`
                json_build_object(
                    'address_id', ba.address_id,
                    'address1', ba.address1,
                    'address2', ba.address2,
                    'city', ba.city,
                    'province', ba.province,
                    'postal_code', ba.postal_code,
                    'country', ba.country
                ) as billing_address
            `)
            .addSelect(`
                json_build_object(
                    'address_id', sa.address_id,
                    'address1', sa.address1,
                    'address2', sa.address2,
                    'city', sa.city,
                    'province', sa.province,
                    'postal_code', sa.postal_code,
                    'country', sa.country
                ) as service_address
            `)
            .from('properties', 'p')
            .leftJoin('addresses', 'ba', 'ba.address_id = p.billing_address_id')
            .leftJoin('addresses', 'sa', 'sa.address_id = p.service_address_id');

        if (accountId) {
            query
                .innerJoin('properties_accounts', 'pa', 'pa.property_id = p.property_id')
                .andWhere('pa.account_id = :accountId', { accountId });
        }

        if (search) {
            query.andWhere(
                'p.name ILIKE :search OR ba.address1 ILIKE :search OR sa.address1 ILIKE :search',
                { search: `%${search}%` }
            );
        }

        const [properties, total] = await Promise.all([
            query
                .offset(Number(offset))
                .limit(Number(limit))
                .orderBy('p.name', 'ASC')
                .getRawMany(),
            query.getCount()
        ]);

        res.json({
            properties,
            total,
            limit: Number(limit),
            offset: Number(offset)
        });
    } catch (error) {
        logger.error('Error listing properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to list properties'
        });
    }
};
