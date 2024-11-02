import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const ACCOUNT_STATUSES_KEY = 'account_statuses';
const DEFAULT_ACCOUNT_STATUSES = {
    statuses: [
        { value: 'active', label: 'Active', color: 'success' },
        { value: 'inactive', label: 'Inactive', color: 'warning' }
    ]
};

export async function getAccountStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: ACCOUNT_STATUSES_KEY }
        });
        
        if (!setting) {
            // Return default statuses if none are set
            const newSetting = settingRepository.create({
                key: ACCOUNT_STATUSES_KEY,
                value: DEFAULT_ACCOUNT_STATUSES
            });
            await settingRepository.save(newSetting);
            return res.json(DEFAULT_ACCOUNT_STATUSES);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting account statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to get account statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateAccountStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        // Validate the structure
        if (!value?.statuses || !Array.isArray(value.statuses)) {
            return res.status(400).json({ 
                message: 'Invalid account statuses format. Expected { statuses: [...] }'
            });
        }

        // Validate each status object
        for (const status of value.statuses) {
            if (!status.value || !status.label || !status.color) {
                return res.status(400).json({
                    message: 'Each status must have value, label, and color properties'
                });
            }
        }

        let setting = await settingRepository.findOne({
            where: { key: ACCOUNT_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: ACCOUNT_STATUSES_KEY,
                value: value
            });
        } else {
            setting.value = value;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating account statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to update account statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
