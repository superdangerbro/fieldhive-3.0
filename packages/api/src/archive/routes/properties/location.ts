import { Request, Response } from 'express';
import { AppDataSource } from '../../config/database';
import { logger } from '../../utils/logger';

export const getPropertyLocation = async (req: Request, res: Response) => {
    const { id } = req.params;
    logger.info('Getting location for property:', id);

    try {
        // First verify the property exists
        const [property] = await AppDataSource.query(`
            SELECT property_id FROM properties WHERE property_id = $1
        `, [id]);

        if (!property) {
            logger.warn('Property not found:', id);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        // Get location data
        const [result] = await AppDataSource.query(`
            SELECT 
                property_id,
                name,
                ST_AsGeoJSON(location)::json as location,
                CASE 
                    WHEN boundary IS NOT NULL THEN 
                        json_build_object(
                            'type', 'Feature',
                            'geometry', ST_AsGeoJSON(boundary)::json,
                            'properties', '{}'::json
                        )
                    ELSE NULL 
                END as boundary
            FROM properties 
            WHERE property_id = $1
        `, [id]);

        // Format the response
        const response = {
            success: true,
            data: {
                property_id: result.property_id,
                name: result.name,
                location: {
                    type: 'Feature',
                    geometry: result.location,
                    properties: {}
                },
                boundary: result.boundary
            }
        };

        logger.info('Property location data:', response);
        res.json(response);
    } catch (error) {
        logger.error('Error getting property location:', {
            propertyId: id,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack
            } : error
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get property location',
            details: error instanceof Error ? error.message : String(error)
        });
    }
};
