import { Request, Response } from 'express';
import { FieldService } from '../../services/fieldService';
import { logger } from '../../../../core/utils/logger';

const fieldService = new FieldService();

export async function archiveField(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving field with ID: ${id}`);

        const field = await fieldService.archive(id);

        if (!field) {
            logger.warn(`Field not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Field not found'
            });
        }

        logger.info('Field archived successfully:', field);
        res.json(field);
    } catch (error) {
        logger.error('Error archiving field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive field',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
