import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const ACCOUNT_TYPES_KEY = 'account_types';
const DEFAULT_ACCOUNT_TYPES = {
    types: [
        { value: 'company', label: 'Company' },
        { value: 'individual', label: 'Individual' }
    ]
};

export async function getAccountTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: ACCOUNT_TYPES_KEY }
        });
        
        if (!setting) {
            // Return default types if none are set
            const newSetting = settingRepository.create({
                key: ACCOUNT_TYPES_KEY,
                value: DEFAULT_ACCOUNT_TYPES
            });
            await settingRepository.save(newSetting);
            return res.json(DEFAULT_ACCOUNT_TYPES);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting account types:', error);
        return res.status(500).json({ 
            message: 'Failed to get account types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateAccountTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        // Validate the structure
        if (!value?.types || !Array.isArray(value.types)) {
            return res.status(400).json({ 
                message: 'Invalid account types format. Expected { types: [...] }'
            });
        }

        // Validate each type object
        for (const type of value.types) {
            if (!type.value || !type.label) {
                return res.status(400).json({
                    message: 'Each type must have value and label properties'
                });
            }
        }

        let setting = await settingRepository.findOne({
            where: { key: ACCOUNT_TYPES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: ACCOUNT_TYPES_KEY,
                value: value
            });
        } else {
            setting.value = value;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating account types:', error);
        return res.status(500).json({ 
            message: 'Failed to update account types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
