import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

const router = Router();

// Get all properties with pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const offset = (page - 1) * pageSize;

        logger.info(`Fetching properties with page ${page}, pageSize ${pageSize}, offset ${offset}`);

        try {
            const [properties, total] = await Promise.all([
                AppDataSource.query(
                    `SELECT 
                        p.property_id as id,
                        p.name,
                        CONCAT_WS(', ', p.address1, p.address2, p.city, p.province, p.postal_code, p.country) as address,
                        p.status,
                        p.type,
                        ST_AsGeoJSON(p.location)::jsonb as location,
                        CASE 
                            WHEN p.boundary IS NOT NULL THEN ST_AsGeoJSON(p.boundary)::jsonb 
                            ELSE NULL 
                        END as boundary,
                        p.created_at as "createdAt",
                        p.updated_at as "updatedAt",
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'accountId', a.account_id,
                                    'name', a.name,
                                    'role', paj.role
                                )
                            ) FILTER (WHERE a.account_id IS NOT NULL),
                            '[]'::json
                        ) as accounts
                    FROM properties p
                    LEFT JOIN properties_accounts_join paj ON paj.property_id = p.property_id
                    LEFT JOIN accounts a ON a.account_id = paj.account_id
                    GROUP BY 
                        p.property_id,
                        p.name,
                        p.address1,
                        p.address2,
                        p.city,
                        p.province,
                        p.postal_code,
                        p.country,
                        p.status,
                        p.type,
                        p.location,
                        p.boundary,
                        p.created_at,
                        p.updated_at
                    ORDER BY p.created_at DESC
                    LIMIT $1 OFFSET $2`,
                    [pageSize, offset]
                ),
                AppDataSource.query('SELECT COUNT(*) as total FROM properties')
            ]);

            logger.info(`Found ${properties.length} properties`);

            res.json({
                properties,
                total: parseInt(total[0].total),
                page,
                pageSize
            });
        } catch (queryError) {
            logger.error('Database query error:', queryError);
            throw queryError;
        }
    } catch (error) {
        logger.error('Error fetching properties:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch properties',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;
