import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyQueryResult {
    property_id: string;
    property_name: string;
    location: string;
}

export async function searchProperties(req: Request, res: Response) {
    try {
        const searchTerm = req.query.search as string;

        if (!searchTerm) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Missing search parameter'
            });
        }

        const query = `
            SELECT DISTINCT
                p.property_id,
                p.name as property_name,
                ST_AsGeoJSON(p.location) as location
            FROM properties p
            WHERE p.name ILIKE $1
            OR p.property_id::text ILIKE $1
            LIMIT 10
        `;

        const searchPattern = `%${searchTerm}%`;
        logger.info('Executing property search query:', { query, searchPattern });
        
        const result = await AppDataSource.query(query, [searchPattern]);
        logger.info('Search results:', { count: result.length });

        // Format results and parse GeoJSON strings to objects
        const formattedProperties = result.map((property: PropertyQueryResult) => ({
            property_id: property.property_id,
            name: property.property_name,
            location: property.location ? JSON.parse(property.location) : null
        }));

        res.json(formattedProperties);
    } catch (error) {
        logger.error('Error in searchProperties:', {
            error,
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to search properties',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
