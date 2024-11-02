import { Request, Response } from 'express';
import { PropertyService } from '../../services/propertyService';
import { UpdatePropertyDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const propertyService = new PropertyService();

export async function updateProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const propertyData: UpdatePropertyDto = req.body;
        logger.info(`Updating property ${id}:`, propertyData);

        const property = await propertyService.update(id, propertyData);

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        logger.info('Property updated successfully:', property);
        res.json(property);
    } catch (error) {
        logger.error('Error updating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
