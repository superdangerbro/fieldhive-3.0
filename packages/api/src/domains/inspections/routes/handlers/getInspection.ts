import { Request, Response } from 'express';
import { InspectionService } from '../../services/inspectionService';
import { logger } from '../../../../core/utils/logger';

const inspectionService = new InspectionService();

export async function getInspection(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting inspection with ID: ${id}`);

        const inspection = await inspectionService.findById(id);

        if (!inspection) {
            logger.warn(`Inspection not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Inspection not found'
            });
        }

        logger.info(`Found inspection:`, inspection);
        res.json(inspection);
    } catch (error) {
        logger.error('Error fetching inspection:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch inspection',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
