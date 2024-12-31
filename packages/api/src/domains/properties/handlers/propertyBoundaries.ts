import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { LRUCache } from 'lru-cache';

interface PropertyResult {
    property_id: string;
    name: string;
    property_type: string;
    status: string;
    boundary: {
        type: string;
        coordinates: number[][][];
    } | null;
}

interface CacheOptions {
    max: number;
    ttl: number;
}

// Initialize LRU cache with TypeScript types
const cacheOptions: CacheOptions = {
    max: 1000, // Increased cache size
    ttl: 1000 * 60 * 5, // Time to live: 5 minutes
};

const cache = new LRUCache<string, any>(cacheOptions);

// Create spatial index if it doesn't exist
const createIndexQuery = `
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_properties_boundary'
        ) THEN
            CREATE INDEX idx_properties_boundary ON properties USING GIST (boundary);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_properties_status'
        ) THEN
            CREATE INDEX idx_properties_status ON properties (status);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'idx_properties_type'
        ) THEN
            CREATE INDEX idx_properties_type ON properties (property_type);
        END IF;
    END $$;
`;

export async function getPropertyBoundaries(req: Request, res: Response) {
    try {
        const boundsStr = req.query.bounds as string;
        const statuses = (req.query.statuses as string || '').split(',').filter(Boolean);
        const types = (req.query.types as string || '').split(',').filter(Boolean);
        const zoom = Math.floor(Number(req.query.zoom) || 10);

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
            return res.json(cachedResult);
        }

        // Ensure indexes exist (will only create if they don't exist)
        await AppDataSource.query(createIndexQuery);

        // Optimized query
        const query = `
            WITH bounds AS (
                SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) as geom
            )
            SELECT 
                p.property_id,
                p.name,
                p.property_type,
                p.status,
                CASE 
                    WHEN p.boundary IS NOT NULL THEN
                        CASE 
                            WHEN $5::integer < 12 THEN ST_AsGeoJSON(ST_SimplifyPreserveTopology(p.boundary, 0.0001))::json
                            WHEN $5::integer < 15 THEN ST_AsGeoJSON(ST_SimplifyPreserveTopology(p.boundary, 0.00001))::json
                            ELSE ST_AsGeoJSON(p.boundary)::json
                        END
                    ELSE NULL
                END as boundary
            FROM properties p, bounds b
            WHERE p.boundary IS NOT NULL 
            AND ST_Intersects(p.boundary, b.geom)
            AND ($6 = '{}'::text[] OR LOWER(p.status) = ANY(SELECT LOWER(unnest($6::text[]))))
            AND ($7 = '{}'::text[] OR LOWER(p.property_type) = ANY(SELECT LOWER(unnest($7::text[]))))
        `;

        const queryParams = [minLng, minLat, maxLng, maxLat, zoom, statuses, types];

        const result = await AppDataSource.query(query, queryParams);

        // Format results as GeoJSON Features
        const formattedResult = result
            .filter((p: PropertyResult) => p && p.boundary)
            .map((p: PropertyResult) => ({
                property_id: p.property_id,
                name: p.name,
                type: p.property_type,
                status: p.status,
                boundary: {
                    type: 'Feature',
                    geometry: p.boundary,
                    properties: {
                        property_id: p.property_id,
                        property_type: p.property_type,
                        status: p.status
                    }
                }
            }));

        // Cache the result
        cache.set(cacheKey, formattedResult);
        
        return res.json(formattedResult);
    } catch (error) {
        logger.error('Error in getPropertyBoundaries:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
