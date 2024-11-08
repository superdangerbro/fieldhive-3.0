import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';
import { repositories } from './repositories';

// Helper function to compare coordinates
function areCoordinatesEqual(coord1: [number, number], coord2: [number, number]): boolean {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
}

// Get property location
export async function getPropertyLocation(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property location for ID: ${id}`);

        const property = await repositories.propertyRepository.findOne({
            where: { property_id: id },
            select: ['property_id', 'location', 'boundary']
        });

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        // Return location and boundary data
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

        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length !== 2 ||
            typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid coordinates format. Expected [longitude, latitude]'
            });
        }

        // Convert GeoJSON coordinates to PostGIS geometry
        const result = await AppDataSource.query(`
            WITH updated AS (
                UPDATE properties 
                SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
                WHERE property_id = $3
                RETURNING property_id, location, boundary
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM updated
        `, [coordinates[0], coordinates[1], id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return raw GeoJSON from database
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

        // Validate coordinates
        if (!Array.isArray(coordinates) || coordinates.length < 3 ||
            !coordinates.every(point => Array.isArray(point) && point.length === 2 &&
                typeof point[0] === 'number' && typeof point[1] === 'number')) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Invalid boundary format. Expected array of [longitude, latitude] coordinates'
            });
        }

        // Ensure the polygon is closed
        const closedCoordinates = [...coordinates];
        if (!areCoordinatesEqual(closedCoordinates[0], closedCoordinates[closedCoordinates.length - 1])) {
            closedCoordinates.push(closedCoordinates[0]);
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
                RETURNING property_id, location, boundary
            )
            SELECT 
                property_id,
                ST_AsGeoJSON(location)::json as location,
                ST_AsGeoJSON(boundary)::json as boundary
            FROM updated
        `, [id]);

        if (!result || result.length === 0) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        const property = result[0];

        // Return raw GeoJSON from database
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
