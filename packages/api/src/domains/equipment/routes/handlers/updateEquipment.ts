import { Request, Response } from 'express';
import { EquipmentService } from '../../services/equipmentService';
import { UpdateEquipmentDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const equipmentService = new EquipmentService();

export async function updateEquipment(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const equipmentData: UpdateEquipmentDto = req.body;
        logger.info(`Updating equipment ${id}:`, equipmentData);

        const equipment = await equipmentService.update(id, equipmentData);

        if (!equipment) {
            logger.warn(`Equipment not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Equipment not found'
            });
        }

        logger.info('Equipment updated successfully:', equipment);
        res.json(equipment);
    } catch (error) {
        logger.error('Error updating equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
