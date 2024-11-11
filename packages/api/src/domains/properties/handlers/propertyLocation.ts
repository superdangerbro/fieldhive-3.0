import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { repositories } from './repositories';

// Get property location
export async function getPropertyLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property location for ID: ${id}`);

        // Query with GeoJSON conversion
        const result = await AppDataSource.query(`
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM properties 
            WHERE property_id = $1
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return GeoJSON formatted data
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error fetching property location:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property location',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update property location
export async function updatePropertyLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;
        logger.info(`Updating property location ${id}:`, coordinates);

        // Basic type check
        if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid coordinates format. Expected [longitude, latitude] as numbers'
            });
        }

        // Convert GeoJSON coordinates to PostGIS geometry
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
                WHERE property_id = $3
                RETURNING property_id
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM properties
            WHERE property_id = $3
        `, [coordinates[0], coordinates[1], id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return GeoJSON formatted data
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error updating property location:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property location',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Update property boundary
export async function updatePropertyBoundary(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;
        logger.info(`Updating property boundary ${id}:`, coordinates);

        // Basic type check
        if (!Array.isArray(coordinates) || coordinates.length < 3 ||
            !coordinates.every(point => Array.isArray(point) && point.length === 2 &&
                typeof point[0] === 'number' && typeof point[1] === 'number')) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid boundary format. Expected array of [longitude, latitude] coordinates as numbers'
            });
        }

        // Ensure the polygon is closed
        const closedCoordinates = [...coordinates];
        if (closedCoordinates[0][0] !== closedCoordinates[closedCoordinates.length - 1][0] || 
            closedCoordinates[0][1] !== closedCoordinates[closedCoordinates.length - 1][1]) {
            closedCoordinates.push([...closedCoordinates[0]]);
        }

        // Convert GeoJSON coordinates to PostGIS geometry
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET boundary = ST_SetSRID(ST_MakePolygon(ST_MakeLine(ARRAY[${
                    closedCoordinates.map((coord: [number, number]) => 
                        `ST_MakePoint(${coord[0]}, ${coord[1]})`
                    ).join(',')
                }])), 4326)
                WHERE property_id = $1
                RETURNING property_id
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM properties
            WHERE property_id = $1
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return GeoJSON formatted data
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error updating property boundary:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property boundary',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

// Delete property boundary
export async function deletePropertyBoundary(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Deleting property boundary for ID: ${id}`);

        // Set boundary to null
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET boundary = NULL
                WHERE property_id = $1
                RETURNING property_id
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM properties
            WHERE property_id = $1
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return GeoJSON formatted data
        res.json({
            location: property.location,
            boundary: property.boundary
        });
    } catch (error) {
        logger.error('Error deleting property boundary:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete property boundary',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
