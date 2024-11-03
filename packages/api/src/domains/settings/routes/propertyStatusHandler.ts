import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const PROPERTY_STATUSES_KEY = 'property_statuses';
const DEFAULT_PROPERTY_STATUSES = {
    statuses: [
        { name: 'Active', color: '#10b981' },
        { name: 'Inactive', color: '#f59e0b' },
        { name: 'Archived', color: '#94a3b8' },
        { name: 'Pending', color: '#3b82f6' }
    ]
};

export async function getPropertyStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: PROPERTY_STATUSES_KEY }
        });
        
        if (!setting) {
            // Return default statuses if none are set
            const newSetting = settingRepository.create({
                key: PROPERTY_STATUSES_KEY,
                value: DEFAULT_PROPERTY_STATUSES
            });
            await settingRepository.save(newSetting);
            return res.json(DEFAULT_PROPERTY_STATUSES);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting property statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to get property statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updatePropertyStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        // Validate the structure
        if (!value?.statuses || !Array.isArray(value.statuses)) {
            return res.status(400).json({ 
                message: 'Invalid property statuses format. Expected { statuses: [...] }'
            });
        }

        // Validate each status object
        for (const status of value.statuses) {
            if (!status.name || !status.color) {
                return res.status(400).json({
                    message: 'Each status must have name and color properties'
                });
            }
        }

        let setting = await settingRepository.findOne({
            where: { key: PROPERTY_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: PROPERTY_STATUSES_KEY,
                value: value
            });
        } else {
            setting.value = value;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating property statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to update property statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
