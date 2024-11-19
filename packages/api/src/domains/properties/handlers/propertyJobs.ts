import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyWithBoundary {
    property_id: string;
    boundary: {
        type: string;
        coordinates: number[][][];
    };
}

export async function getPropertiesWithActiveJobs(req: Request, res: Response) {
    try {
        const boundsStr = req.query.bounds as string;
        if (!boundsStr) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Missing bounds parameter'
            });
        }

        // Parse bounds [minLng, minLat, maxLng, maxLat]
        const [minLng, minLat, maxLng, maxLat] = boundsStr.split(',').map(Number);
        if ([minLng, minLat, maxLng, maxLat].some(isNaN)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid bounds format. Expected minLng,minLat,maxLng,maxLat'
            });
        }

        // Create bounds polygon
        const boundsPolygon = `ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)`;

        // Query properties with active jobs within bounds
        const result = await AppDataSource.query(`
            SELECT DISTINCT
                p.property_id,
                ST_AsGeoJSON(p.boundary)::json as boundary
            FROM properties p
            INNER JOIN jobs j ON j.property_id = p.property_id
            WHERE j.status = 'active'
            AND p.boundary IS NOT NULL
            AND ST_Intersects(p.boundary, ${boundsPolygon})
        `);

        // Return GeoJSON formatted data
        res.json(result.map((property: PropertyWithBoundary) => ({
            property_id: property.property_id,
            boundary: {
                type: 'Feature',
                geometry: property.boundary,
                properties: {
                    property_id: property.property_id
                }
            }
        })));
    } catch (error) {
        logger.error('Error fetching properties with active jobs:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch properties with active jobs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
