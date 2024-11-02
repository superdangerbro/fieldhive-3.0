import { Request, Response } from 'express';
import { InspectionService } from '../../services/inspectionService';
import { CreateInspectionDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const inspectionService = new InspectionService();

export async function createInspection(req: Request, res: Response) {
    try {
        const inspectionData: CreateInspectionDto = req.body;
        logger.info('Creating new inspection:', inspectionData);

        const inspection = await inspectionService.create(inspectionData);
        
        logger.info('Inspection created successfully:', inspection);
        res.status(201).json(inspection);
    } catch (error) {
        logger.error('Error creating inspection:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create inspection',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
