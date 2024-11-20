import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyResult {
    property_id: string;
    boundary: {
        type: string;
        coordinates: number[][][];
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
                WHERE TRUE
            `;
            const jobParams: any[] = [];

            if (statuses.length > 0) {
                jobParams.push(statuses);
                jobQuery += ` AND j.status = ANY($1)`;
            }
            if (types.length > 0) {
                jobParams.push(types);
                jobQuery += ` AND j.job_type_id = ANY($${jobParams.length})`;
            }

            logger.info('Executing job query:', { jobQuery, jobParams });
            const jobResults = await AppDataSource.query(jobQuery, jobParams);
            logger.info('Job query results:', { count: jobResults.length });

            if (jobResults.length === 0) {
                return res.json([]);
            }

            // Step 2: Get property boundaries
            const propertyIds = jobResults.map((r: JobResult) => r.property_id);
            const boundaryQuery = `
                SELECT 
                    p.property_id,
                    CASE 
                        WHEN ST_IsValid(p.boundary) THEN ST_AsGeoJSON(p.boundary)::json
                        ELSE NULL
                    END as boundary
                FROM properties p
                WHERE p.property_id = ANY($1)
                AND p.boundary IS NOT NULL
                AND ST_IsValid(p.boundary)
                AND ST_Intersects(
                    p.boundary,
                    ST_MakeEnvelope($2, $3, $4, $5, 4326)
                )
            `;
            const boundaryParams = [propertyIds, minLng, minLat, maxLng, maxLat];

            logger.info('Executing boundary query:', { 
                boundaryQuery, 
                paramCount: boundaryParams.length,
                propertyCount: propertyIds.length
            });

            const result = await AppDataSource.query(boundaryQuery, boundaryParams);
            logger.info('Boundary query results:', { 
                count: result.length,
                sample: result[0]
            });

            // Format results as GeoJSON Features
            const formattedResult = result
                .filter((property: PropertyResult) => 
                    property && 
                    property.boundary && 
                    typeof property.boundary === 'object'
                )
                .map((property: PropertyResult) => ({
                    property_id: property.property_id,
                    boundary: {
                        type: 'Feature',
                        geometry: property.boundary,
                        properties: {
                            property_id: property.property_id
                        }
                    }
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
