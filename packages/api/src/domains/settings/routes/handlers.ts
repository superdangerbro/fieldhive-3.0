import { Request, Response } from 'express';
import { SettingService } from '../services/settingService';
import { CreateSettingDto, UpdateSettingDto } from '../types';
import { logger } from '../../../core/utils/logger';

const settingService = new SettingService();

const DEFAULT_SETTINGS = {
    job_types: ['Inspection', 'Maintenance', 'Repair'],
    job_statuses: ['pending', 'in_progress', 'completed', 'cancelled']
};

export async function getSetting(req: Request, res: Response) {
    try {
        const { id } = req.params;
        
        const setting = await settingService.findByKey(id);
        
        // If setting not found, return appropriate defaults
        if (!setting) {
            const defaultValue = DEFAULT_SETTINGS[id as keyof typeof DEFAULT_SETTINGS];
            if (defaultValue) {
                return res.json(defaultValue);
            }
            return res.status(404).json({ 
                message: `Setting ${id} not found`,
                key: id
            });
        }

        // Special handling for job_types endpoint
        if (id === 'job_types' && req.path === '/job_types') {
            const types = setting.value as string[];
            return res.json({ 
                jobTypes: types.map(name => ({ 
                    id: name.toLowerCase().replace(/\s+/g, '_'),
                    name 
                }))
            });
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting setting:', error);
        return res.status(500).json({ 
            message: 'Failed to get setting',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateSetting(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const settingData: UpdateSettingDto = req.body;

        // Special handling for job_types
        if (id === 'job_types') {
            // If we're receiving the API format
            if (settingData.value?.jobTypes) {
                settingData.value = settingData.value.jobTypes.map((type: any) => type.name);
            }
            // If we're receiving a direct array of strings
            else if (!Array.isArray(settingData.value)) {
                return res.status(400).json({ 
                    message: 'Job types must be an array'
                });
            }
        }

        // Use upsert to create or update
        const updated = await settingService.upsertByKey(id, settingData.value);

        // Return in the appropriate format
        if (id === 'job_types' && req.path === '/job_types') {
            const types = updated.value as string[];
            return res.json({ 
                jobTypes: types.map(name => ({ 
                    id: name.toLowerCase().replace(/\s+/g, '_'),
                    name 
                }))
            });
        }

        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating setting:', error);
        return res.status(500).json({ 
            message: 'Failed to update setting',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function createSetting(req: Request, res: Response) {
    try {
        const settingData: CreateSettingDto = req.body;

        // Validate required fields
        if (!settingData.key) {
            return res.status(400).json({ message: 'Setting key is required' });
        }
        if (settingData.value === undefined || settingData.value === null) {
            return res.status(400).json({ message: 'Setting value is required' });
        }

        // Check if setting already exists
        const existing = await settingService.findByKey(settingData.key);
        if (existing) {
            return res.status(400).json({ 
                message: `Setting ${settingData.key} already exists` 
            });
        }

        const setting = await settingService.create(settingData);
        return res.status(201).json(setting.value);
    } catch (error) {
        logger.error('Error creating setting:', error);
        return res.status(500).json({ 
            message: 'Failed to create setting',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
