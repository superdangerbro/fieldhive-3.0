import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const EQUIPMENT_STATUSES_KEY = 'equipment_statuses';

export async function getEquipmentStatuses(req: Request, res: Response) {
    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        const setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_STATUSES_KEY }
        });
        return res.json(setting?.value || []);
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
        const settingRepository = AppDataSource.getRepository(Setting);
        const { value } = req.body;

        if (!Array.isArray(value)) {
            return res.status(400).json({ 
                message: 'Equipment statuses must be an array'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: EQUIPMENT_STATUSES_KEY,
                value: value
            });
        } else {
            setting.value = value;
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
