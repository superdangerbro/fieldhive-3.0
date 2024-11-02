import { Request, Response } from 'express';
import { PropertyService } from '../../services/propertyService';
import { CreatePropertyDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const propertyService = new PropertyService();

export async function createProperty(req: Request, res: Response) {
    try {
        const propertyData: CreatePropertyDto = req.body;
        logger.info('Creating new property:', propertyData);

        const property = await propertyService.create(propertyData);
        
        logger.info('Property created successfully:', property);
        res.status(201).json(property);
    } catch (error) {
        logger.error('Error creating property:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create property',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
