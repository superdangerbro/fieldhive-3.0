import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyResult {
    property_id: string;
    name: string;
    property_type: string;
    status: string;
    service_address_id: string;
    billing_address_id: string;
    created_at: Date;
    updated_at: Date;
    boundary: {
        type: string;
        coordinates: number[][][];
    } | null;
    location: {
        type: string;
        coordinates: [number, number];
    } | null;
}

export async function getPropertyBoundaries(req: Request, res: Response) {
    try {
        const boundsStr = req.query.bounds as string;
        const statuses = (req.query.statuses as string || '').split(',').filter(Boolean);
        const types = (req.query.types as string || '').split(',').filter(Boolean);

        logger.info('Request parameters:', {
            bounds: boundsStr,
            statuses,
            types
        });

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

        try {
            // Build the query with AND conditions for filters
            let query = `
                SELECT 
                    p.property_id,
                    p.name,
                    p.property_type,
                    p.status,
                    p.service_address_id,
                    p.billing_address_id,
                    p.created_at,
                    p.updated_at,
                    CASE 
                        WHEN ST_IsValid(p.boundary) THEN ST_AsGeoJSON(p.boundary)::json
                        ELSE NULL
                    END as boundary,
                    CASE 
                        WHEN ST_IsValid(p.location) THEN ST_AsGeoJSON(p.location)::json
                        ELSE NULL
                    END as location
                FROM properties p
                WHERE TRUE
            `;
            const queryParams: any[] = [];

            // Add status filter
            if (statuses.length > 0) {
                queryParams.push(statuses);
                query += ` AND p.status = ANY($${queryParams.length})`;
            }

            // Add type filter (using 'property_type' column)
            if (types.length > 0) {
                queryParams.push(types);
                query += ` AND p.property_type = ANY($${queryParams.length})`;
            }

            // Add bounds condition
            queryParams.push(minLng, minLat, maxLng, maxLat);
            const boundsCondition = `
                AND (
                    (p.boundary IS NOT NULL AND ST_IsValid(p.boundary) AND 
                     ST_Intersects(p.boundary, ST_MakeEnvelope($${queryParams.length - 3}, $${queryParams.length - 2}, $${queryParams.length - 1}, $${queryParams.length}, 4326)))
                    OR
                    (p.location IS NOT NULL AND ST_IsValid(p.location) AND 
                     ST_Intersects(p.location, ST_MakeEnvelope($${queryParams.length - 3}, $${queryParams.length - 2}, $${queryParams.length - 1}, $${queryParams.length}, 4326)))
                )
            `;
            query += boundsCondition;

            logger.info('Executing property query:', { 
                query, 
                paramCount: queryParams.length,
                params: queryParams
            });

            const result = await AppDataSource.query(query, queryParams);
            logger.info('Property query results:', { 
                count: result.length,
                sample: result[0]
            });

            // Format results as GeoJSON Features
            const formattedResult = result
                .filter((property: PropertyResult) => 
                    property && 
                    (property.boundary || property.location)
                )
                .map((property: PropertyResult) => ({
                    property_id: property.property_id,
                    name: property.name,
                    type: property.property_type,
                    status: property.status,
                    service_address_id: property.service_address_id,
                    billing_address_id: property.billing_address_id,
                    created_at: property.created_at,
                    updated_at: property.updated_at,
                    boundary: property.boundary ? {
                        type: 'Feature',
                        geometry: property.boundary,
                        properties: {
                            property_id: property.property_id
                        }
                    } : null,
                    location: property.location ? {
                        type: 'Feature',
                        geometry: property.location,
                        properties: {
                            property_id: property.property_id
                        }
                    } : null
                }));

            logger.info('Formatted results:', { 
                count: formattedResult.length,
                sample: formattedResult[0]
            });

            res.json(formattedResult);
        } catch (queryError) {
            logger.error('Database query error:', {
                error: queryError,
                message: queryError instanceof Error ? queryError.message : String(queryError)
            });
            throw queryError;
        }
    } catch (error) {
        logger.error('Error in getPropertyBoundaries:', {
            error,
            message: error instanceof Error ? error.message : String(error)
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property boundaries',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
