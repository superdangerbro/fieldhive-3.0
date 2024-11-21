import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyResult {
    property_id: string;
    boundary: {
        type: string;
        coordinates: number[][][];
    } | null;
    location: {
        type: string;
        coordinates: [number, number];
    } | null;
}

interface JobResult {
    property_id: string;
}

export async function getPropertiesWithActiveJobs(req: Request, res: Response) {
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
            // Step 1: Get property IDs with active jobs
            let jobQuery = `
                SELECT DISTINCT j.property_id
                FROM jobs j
                WHERE FALSE
            `;
            const jobParams: any[] = [];

            // Build OR conditions for filters
            const conditions = [];
            
            if (statuses.length > 0) {
                jobParams.push(statuses);
                conditions.push(`j.status = ANY($${jobParams.length})`);
            }
            if (types.length > 0) {
                jobParams.push(types);
                conditions.push(`j.job_type_id = ANY($${jobParams.length})`);
            }

            // Add OR conditions if any exist
            if (conditions.length > 0) {
                jobQuery = jobQuery.replace('WHERE FALSE', `WHERE ${conditions.join(' OR ')}`);
            }

            logger.info('Executing job query:', { jobQuery, jobParams });
            const jobResults = await AppDataSource.query(jobQuery, jobParams);
            logger.info('Job query results:', { count: jobResults.length });

            if (jobResults.length === 0) {
                return res.json([]);
            }

            // Step 2: Get property boundaries and locations
            const propertyIds = jobResults.map((r: JobResult) => r.property_id);
            const propertyQuery = `
                SELECT 
                    p.property_id,
                    CASE 
                        WHEN ST_IsValid(p.boundary) THEN ST_AsGeoJSON(p.boundary)::json
                        ELSE NULL
                    END as boundary,
                    CASE 
                        WHEN ST_IsValid(p.location) THEN ST_AsGeoJSON(p.location)::json
                        ELSE NULL
                    END as location
                FROM properties p
                WHERE p.property_id = ANY($1)
                AND (
                    (p.boundary IS NOT NULL AND ST_IsValid(p.boundary) AND 
                     ST_Intersects(p.boundary, ST_MakeEnvelope($2, $3, $4, $5, 4326)))
                    OR
                    (p.location IS NOT NULL AND ST_IsValid(p.location) AND 
                     ST_Intersects(p.location, ST_MakeEnvelope($2, $3, $4, $5, 4326)))
                )
            `;
            const propertyParams = [propertyIds, minLng, minLat, maxLng, maxLat];

            logger.info('Executing property query:', { 
                propertyQuery, 
                paramCount: propertyParams.length,
                propertyCount: propertyIds.length
            });

            const result = await AppDataSource.query(propertyQuery, propertyParams);
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
                    boundary: property.boundary ? {
                        type: 'Feature',
                        geometry: property.boundary,
                        properties: {
                            property_id: property.property_id
                        }
                    } : null,
                    location: property.location ? {
                        type: 'Point',
                        coordinates: property.location.coordinates
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
        logger.error('Error in getPropertiesWithActiveJobs:', {
            error,
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch properties with jobs',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
