import { Request, Response } from 'express';
import { PropertyService } from '../../services/propertyService';
import { logger } from '../../../../core/utils/logger';

const propertyService = new PropertyService();

export async function archiveProperty(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving property with ID: ${id}`);

        const property = await propertyService.archive(id);

        if (!property) {
            logger.warn(`Property not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Property not found'
            });
        }

        logger.info('Property archived successfully:', property);
        res.json(property);
    } catch (error) {
        logger.error('Error archiving property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
