import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const JOB_STATUSES_KEY = 'job_statuses';

export async function getJobStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: JOB_STATUSES_KEY }
        });
        
        if (!setting) {
            return res.json([]);
        }

        // Handle legacy format (array of strings)
        if (Array.isArray(setting.value) && setting.value.length > 0 && typeof setting.value[0] === 'string') {
            const convertedStatuses = setting.value.map(status => ({
                name: status,
                color: '#94a3b8'  // Default gray color
            }));
            
            // Update the setting to new format
            setting.value = convertedStatuses;
            await settingRepository.save(setting);
            return res.json(convertedStatuses);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting job statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to get job statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateJobStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        if (!Array.isArray(value)) {
            return res.status(400).json({ 
                message: 'Job statuses must be an array'
            });
        }

        // Handle legacy format (array of strings)
        let statuses = value;
        if (value.length > 0 && typeof value[0] === 'string') {
            statuses = value.map(status => ({
                name: status,
                color: '#94a3b8'  // Default gray color
            }));
        }

        // Validate each status has required properties and valid hex color
        const isValidHexColor = (color: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
        
        if (!statuses.every(status => 
            typeof status === 'object' &&
            typeof status.name === 'string' &&
            typeof status.color === 'string' &&
            isValidHexColor(status.color)
        )) {
            return res.status(400).json({
                message: 'Each status must have a name (string) and valid hex color (e.g., "#ff0000")'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: JOB_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: JOB_STATUSES_KEY,
                value: statuses
            });
        } else {
            setting.value = statuses;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating job statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to update job statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
