import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const getPropertiesInBounds = async (req: Request, res: Response) => {
    try {
        const { bounds } = req.query;
        
        logger.info('Received bounds query:', { bounds, query: req.query });
        
        if (!bounds) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Bounds parameter is required'
            });
        }

        const [west, south, east, north] = (bounds as string).split(',').map(Number);

        if ([west, south, east, north].some(isNaN)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid bounds format. Expected: west,south,east,north'
            });
        }

        logger.info('Executing spatial query with bounds:', { west, south, east, north });

        // Query with additional property information
        const query = `
            SELECT 
                p.property_id,
                p.name,
                p.property_type,
                p.status,
                ST_AsGeoJSON(p.location)::json as location,
                ba.address1 as billing_address1,
                ba.city as billing_city,
                ba.province as billing_province,
                sa.address1 as service_address1,
                sa.city as service_city,
                sa.province as service_province,
                COALESCE(
                    (
                        SELECT json_agg(json_build_object(
                            'account_id', a.account_id,
                            'name', a.name
                        ))
                        FROM properties_accounts pa
                        JOIN accounts a ON a.account_id = pa.account_id
                        WHERE pa.property_id = p.property_id
                    ),
                    '[]'::json
                ) as accounts,
                COALESCE(
                    (
                        SELECT json_build_object(
                            'total', COUNT(*),
                            'pending', COUNT(*) FILTER (WHERE status = 'pending'),
                            'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
                            'completed', COUNT(*) FILTER (WHERE status = 'completed'),
                            'cancelled', COUNT(*) FILTER (WHERE status = 'cancelled'),
                            'latest', (
                                SELECT json_build_object(
                                    'title', title,
                                    'status', status,
                                    'created_at', created_at
                                )
                                FROM jobs j2
                                WHERE j2.property_id = p.property_id
                                ORDER BY created_at DESC
                                LIMIT 1
                            )
                        )
                        FROM jobs j
                        WHERE j.property_id = p.property_id
                    ),
                    json_build_object(
                        'total', 0,
                        'pending', 0,
                        'in_progress', 0,
                        'completed', 0,
                        'cancelled', 0,
                        'latest', null
                    )
                ) as job_stats
            FROM properties p
            LEFT JOIN addresses ba ON ba.address_id = p.billing_address_id
            LEFT JOIN addresses sa ON sa.address_id = p.service_address_id
            WHERE ST_Intersects(
                p.location::geometry,
                ST_MakeEnvelope($1, $2, $3, $4, 4326)
            )
        `;

        const properties = await AppDataSource.query(query, [west, south, east, north]);

        logger.info('Query executed successfully, found properties:', { count: properties.length });

        // Log the first property as a sample
        if (properties.length > 0) {
            logger.info('Sample property:', {
                id: properties[0].property_id,
                name: properties[0].name,
                jobStats: properties[0].job_stats
            });
        }

        const mappedProperties = properties.map((prop: any) => ({
            property_id: prop.property_id,
            name: prop.name,
            property_type: prop.property_type,
            status: prop.status || 'active',
            location: prop.location,
            billing_address: prop.billing_address1 ? {
                address1: prop.billing_address1,
                city: prop.billing_city,
                province: prop.billing_province
            } : null,
            service_address: prop.service_address1 ? {
                address1: prop.service_address1,
                city: prop.service_city,
                province: prop.service_province
            } : null,
            accounts: prop.accounts || [],
            job_stats: prop.job_stats
        }));

        const response = { properties: mappedProperties };
        logger.info('Response:', JSON.stringify(response, null, 2));

        res.json(response);
    } catch (error) {
        logger.error('Error getting properties in bounds:', {
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error,
            query: req.query
        });
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get properties in bounds',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
