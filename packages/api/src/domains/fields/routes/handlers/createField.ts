import { Request, Response } from 'express';
import { FieldService } from '../../services/fieldService';
import { CreateFieldDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const fieldService = new FieldService();

export async function createField(req: Request, res: Response) {
    try {
        const fieldData: CreateFieldDto = req.body;
        logger.info('Creating new field:', fieldData);

        const field = await fieldService.create(fieldData);
        
        logger.info('Field created successfully:', field);
        res.status(201).json(field);
    } catch (error) {
        logger.error('Error creating field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create field',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
