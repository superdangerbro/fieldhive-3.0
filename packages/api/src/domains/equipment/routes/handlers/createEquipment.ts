import { Request, Response } from 'express';
import { EquipmentService } from '../../services/equipmentService';
import { CreateEquipmentDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const equipmentService = new EquipmentService();

export async function createEquipment(req: Request, res: Response) {
    try {
        const equipmentData: CreateEquipmentDto = req.body;
        logger.info('Creating new equipment:', equipmentData);

        const equipment = await equipmentService.create(equipmentData);
        
        logger.info('Equipment created successfully:', equipment);
        res.status(201).json(equipment);
    } catch (error) {
        logger.error('Error creating equipment:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create equipment',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
