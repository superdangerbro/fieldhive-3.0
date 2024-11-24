import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

interface PropertyQueryResult {
    property_id: string;
    property_name: string;
    location: string;
}

interface JobQueryResult {
    job_id: string;
    job_name: string;
    property_id: string;
    property_name: string;
    location: string;
}

export async function getPropertiesWithActiveJobs(req: Request, res: Response) {
    try {
        const boundsStr = req.query.bounds as string;
        const propertyId = req.query.propertyId as string;

        logger.info('Request parameters:', {
            bounds: boundsStr,
            propertyId
        });

        // If propertyId is provided, return jobs for that property
        if (propertyId) {
            const jobQuery = `
                SELECT 
                    j.job_id,
                    j.name as job_name,
                    p.property_id,
                    p.name as property_name,
                    ST_AsGeoJSON(p.location) as location
                FROM jobs j
                INNER JOIN properties p ON j.property_id = p.property_id
                WHERE j.property_id = $1
                AND j.status != 'Archived'
                AND j.status != 'archived'
            `;

            logger.info('Executing job query:', { jobQuery, propertyId });
            const jobResults = await AppDataSource.query(jobQuery, [propertyId]);
            logger.info('Job query results:', { count: jobResults.length });

            // Parse GeoJSON strings to objects
            const formattedJobs = jobResults.map((job: JobQueryResult) => ({
                ...job,
                location: job.location ? JSON.parse(job.location) : null
            }));

            return res.json(formattedJobs);
        }

        // Otherwise, return nearby properties
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
            // Get nearby properties regardless of jobs
            const propertyQuery = `
                SELECT DISTINCT
                    p.property_id,
                    p.name as property_name,
                    ST_AsGeoJSON(p.location) as location
                FROM properties p
                WHERE p.location IS NOT NULL 
                AND ST_Intersects(
                    p.location, 
                    ST_MakeEnvelope($1, $2, $3, $4, 4326)
                )
            `;

            logger.info('Executing property query:', { propertyQuery });
            const result = await AppDataSource.query(propertyQuery, [minLng, minLat, maxLng, maxLat]);
            logger.info('Property query results:', { count: result.length });

            // Format results and parse GeoJSON strings to objects
            const formattedProperties = result.map((property: PropertyQueryResult) => ({
                property_id: property.property_id,
                name: property.property_name,
                location: property.location ? JSON.parse(property.location) : null
            }));

            res.json(formattedProperties);
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
            message: 'Failed to fetch properties',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
