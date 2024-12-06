import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { LRUCache } from 'lru-cache';

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

interface CacheOptions {
    max: number;
    ttl: number;
}

// Initialize LRU cache with TypeScript types
const cacheOptions: CacheOptions = {
    max: 500, // Maximum number of items to store
    ttl: 1000 * 60 * 5, // Time to live: 5 minutes
};

const cache = new LRUCache<string, any>(cacheOptions);

export async function getPropertyBoundaries(req: Request, res: Response) {
    try {
        const boundsStr = req.query.bounds as string;
        const statuses = (req.query.statuses as string || '').split(',').filter(Boolean);
        const types = (req.query.types as string || '').split(',').filter(Boolean);
        const zoom = Math.floor(Number(req.query.zoom) || 10); // Convert to integer

        logger.info('Request parameters:', {
            bounds: boundsStr,
            statuses,
            types,
            zoom
        });

        if (!boundsStr) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Missing bounds parameter'
            });
        }

        // Parse bounds [minLng, minLat, maxLng, maxLat]
        const bounds = boundsStr
            .split(',')
            .map(coord => coord.trim())
            .map(coord => {
                const num = Number(coord);
                if (isNaN(num)) {
                    throw new Error(`Invalid coordinate: ${coord}`);
                }
                return num;
            });

        if (bounds.length !== 4) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid bounds format. Expected minLng,minLat,maxLng,maxLat'
            });
        }

        const [minLng, minLat, maxLng, maxLat] = bounds;

        // Validate coordinate ranges
        if (minLng < -180 || maxLng > 180 || minLat < -90 || maxLat > 90) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Coordinates out of range'
            });
        }

        // Generate cache key
        const cacheKey = `boundaries:${bounds.join(',')}:${statuses.join(',')}:${types.join(',')}:${zoom}`;
        
        // Check cache first
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            logger.info('Returning cached result for:', cacheKey);
            return res.json(cachedResult);
        }

        try {
            // Build the query with OR conditions for filters and geometry simplification
            const query = `
                WITH bounds AS (
                    SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) as geom
                )
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
                        WHEN p.boundary IS NOT NULL AND ST_IsValid(p.boundary) THEN
                            CASE 
                                WHEN $5::integer < 12 THEN ST_AsGeoJSON(ST_SimplifyPreserveTopology(p.boundary, 0.01))::json
                                WHEN $5::integer < 15 THEN ST_AsGeoJSON(ST_SimplifyPreserveTopology(p.boundary, 0.001))::json
                                ELSE ST_AsGeoJSON(p.boundary)::json
                            END
                        ELSE NULL
                    END as boundary,
                    CASE 
                        WHEN p.location IS NOT NULL AND ST_IsValid(p.location) THEN ST_AsGeoJSON(p.location)::json
                        ELSE NULL
                    END as location
                FROM properties p, bounds b
                WHERE (
                    (p.boundary IS NOT NULL AND ST_IsValid(p.boundary) AND ST_Intersects(p.boundary, b.geom))
                    OR
                    (p.location IS NOT NULL AND ST_IsValid(p.location) AND ST_Intersects(p.location, b.geom))
                )
                AND (
                    $6 = '{}'::text[] 
                    OR LOWER(p.status) = ANY(SELECT LOWER(unnest($6::text[])))
                )
                AND (
                    $7 = '{}'::text[] 
                    OR LOWER(p.property_type) = ANY(SELECT LOWER(unnest($7::text[])))
                )
            `;

            const queryParams = [
                minLng, minLat, maxLng, maxLat,
                zoom,
                statuses,
                types
            ];

            logger.info('Executing property query:', { 
                paramCount: queryParams.length,
                params: queryParams,
                bounds: [minLng, minLat, maxLng, maxLat]
            });

            const result = await AppDataSource.query(query, queryParams);
            logger.info('Query results:', { count: result.length });

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
                            property_id: property.property_id,
                            property_type: property.property_type,
                            status: property.status
                        }
                    } : null,
                    location: property.location ? {
                        type: 'Feature',
                        geometry: property.location,
                        properties: {
                            property_id: property.property_id,
                            property_type: property.property_type,
                            status: property.status
                        }
                    } : null
                }));

            logger.info('Formatted results:', { 
                count: formattedResult.length,
                sample: formattedResult[0]
            });

            // Cache the result
            cache.set(cacheKey, formattedResult);

            res.json(formattedResult);
        } catch (queryError) {
            logger.error('Database query error:', {
                error: queryError,
                message: queryError instanceof Error ? queryError.message : String(queryError),
                stack: queryError instanceof Error ? queryError.stack : undefined
            });
            throw queryError;
        }
    } catch (error) {
        logger.error('Error in getPropertyBoundaries:', {
            error,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property boundaries',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
