import { Request, Response } from 'express';
import { FieldService } from '../../services/fieldService';
import { UpdateFieldDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const fieldService = new FieldService();

export async function updateField(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const fieldData: UpdateFieldDto = req.body;
        logger.info(`Updating field ${id}:`, fieldData);

        const field = await fieldService.update(id, fieldData);

        if (!field) {
            logger.warn(`Field not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Field not found'
            });
        }

        logger.info('Field updated successfully:', field);
        res.json(field);
    } catch (error) {
        logger.error('Error updating field:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update field',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
