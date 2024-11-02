import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const EQUIPMENT_TYPES_KEY = 'equipment_types';

export async function getEquipmentTypes(req: Request, res: Response) {
    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_TYPES_KEY }
        });
        
        // Return empty array if no types exist yet
        if (!setting) {
            return res.json([]);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting equipment types:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateEquipmentTypes(req: Request, res: Response) {
    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        const types = req.body.value;

        // Validate input
        if (!Array.isArray(types)) {
            return res.status(400).json({ 
                message: 'Equipment types must be an array'
            });
        }

        // Validate each type has required fields
        if (!types.every(type => 
            typeof type === 'object' && 
            typeof type.name === 'string' && 
            Array.isArray(type.fields)
        )) {
            return res.status(400).json({
                message: 'Each type must have a name and fields array'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_TYPES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: EQUIPMENT_TYPES_KEY,
                value: types
            });
        } else {
            setting.value = types;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating equipment types:', error);
        return res.status(500).json({ 
            message: 'Failed to update equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
