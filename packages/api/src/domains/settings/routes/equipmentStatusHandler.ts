import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const EQUIPMENT_STATUSES_KEY = 'equipment_statuses';

export async function getEquipmentStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_STATUSES_KEY }
        });
        
        // Return empty array if no statuses exist yet
        if (!setting) {
            return res.json([]);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting equipment statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to get equipment statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateEquipmentStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const statuses = req.body.value;

        // Validate input
        if (!Array.isArray(statuses)) {
            return res.status(400).json({ 
                message: 'Equipment statuses must be an array'
            });
        }

        // Validate each status is a string
        if (!statuses.every(status => typeof status === 'string')) {
            return res.status(400).json({
                message: 'Each status must be a string'
            });
        }

        // Remove duplicates and sort
        const uniqueStatuses = [...new Set(statuses)].sort();

        let setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: EQUIPMENT_STATUSES_KEY,
                value: uniqueStatuses
            });
        } else {
            setting.value = uniqueStatuses;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating equipment statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to update equipment statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
