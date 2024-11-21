import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { logger } from '../../../utils/logger';

export async function getPropertyOptions(req: Request, res: Response) {
    try {
        // Get unique property statuses and types directly from properties table
        const optionsQuery = `
            SELECT 
                ARRAY_AGG(DISTINCT status ORDER BY status) FILTER (WHERE status IS NOT NULL) as statuses,
                ARRAY_AGG(DISTINCT property_type ORDER BY property_type) FILTER (WHERE property_type IS NOT NULL) as types
            FROM properties;
        `;

        try {
            const [result] = await AppDataSource.query(optionsQuery);
            res.json({
                statuses: result.statuses || [],
                types: result.types || []
            });
        } catch (queryError) {
            logger.error('Database query error:', {
                error: queryError,
                message: queryError instanceof Error ? queryError.message : String(queryError)
            });
            throw queryError;
        }
    } catch (error) {
        logger.error('Error in getPropertyOptions:', {
            error,
            message: error instanceof Error ? error.message : String(error)
        });

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property options',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
