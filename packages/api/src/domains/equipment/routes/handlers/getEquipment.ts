import { Request, Response } from 'express';
import { EquipmentService } from '../../services/equipmentService';
import { logger } from '../../../../core/utils/logger';

const equipmentService = new EquipmentService();

export async function getEquipment(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting equipment with ID: ${id}`);

        const equipment = await equipmentService.findById(id);

        if (!equipment) {
            logger.warn(`Equipment not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment not found'
            });
        }

        logger.info(`Found equipment:`, equipment);
        res.json(equipment);
    } catch (error) {
        logger.error('Error fetching equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
