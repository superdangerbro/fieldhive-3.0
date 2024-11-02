import { Request, Response } from 'express';
import { EquipmentService } from '../../services/equipmentService';
import { logger } from '../../../../core/utils/logger';

const equipmentService = new EquipmentService();

export async function archiveEquipment(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Archiving equipment with ID: ${id}`);

        const equipment = await equipmentService.archive(id);

        if (!equipment) {
            logger.warn(`Equipment not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment not found'
            });
        }

        logger.info('Equipment archived successfully:', equipment);
        res.json(equipment);
    } catch (error) {
        logger.error('Error archiving equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to archive equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
