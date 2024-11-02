import { Request, Response } from 'express';
import { InspectionService } from '../../services/inspectionService';
import { UpdateInspectionDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const inspectionService = new InspectionService();

export async function updateInspection(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const inspectionData: UpdateInspectionDto = req.body;
        logger.info(`Updating inspection ${id}:`, inspectionData);

        const inspection = await inspectionService.update(id, inspectionData);

        if (!inspection) {
            logger.warn(`Inspection not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Inspection not found'
            });
        }

        logger.info('Inspection updated successfully:', inspection);
        res.json(inspection);
    } catch (error) {
        logger.error('Error updating inspection:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update inspection',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
