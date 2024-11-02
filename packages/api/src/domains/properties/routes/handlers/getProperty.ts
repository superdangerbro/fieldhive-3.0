import { Request, Response } from 'express';
import { PropertyService } from '../../services/propertyService';
import { logger } from '../../../../core/utils/logger';

const propertyService = new PropertyService();

export async function getProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting property with ID: ${id}`);

        const property = await propertyService.findById(id);

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        logger.info(`Found property:`, property);
        res.json(property);
    } catch (error) {
        logger.error('Error fetching property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
