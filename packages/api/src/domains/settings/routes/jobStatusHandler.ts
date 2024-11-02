import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const JOB_STATUSES_KEY = 'job_statuses';
const DEFAULT_JOB_STATUSES = [
    { name: 'Pending', color: 'warning' },
    { name: 'In Progress', color: 'info' },
    { name: 'Completed', color: 'success' },
    { name: 'Cancelled', color: 'error' }
];

const VALID_COLORS = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];

// Helper function to convert legacy status to new format
const convertToNewFormat = (status: string) => {
    const colorMap: Record<string, string> = {
        'pending': 'warning',
        'in_progress': 'info',
        'completed': 'success',
        'cancelled': 'error'
    };

    return {
        name: status,
        color: colorMap[status.toLowerCase()] || 'default'
    };
};

// Helper function to convert new format to legacy format for backward compatibility
const convertToLegacyFormat = (status: { name: string; color: string }) => {
    return status.name.toLowerCase().replace(/\s+/g, '_');
};

export async function getJobStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: JOB_STATUSES_KEY }
        });
        
        if (!setting) {
            // Return default statuses if none are set
            const newSetting = settingRepository.create({
                key: JOB_STATUSES_KEY,
                value: DEFAULT_JOB_STATUSES
            });
            await settingRepository.save(newSetting);

            // Return in legacy format if requested
            if (req.query.format === 'legacy') {
                return res.json(DEFAULT_JOB_STATUSES.map(convertToLegacyFormat));
            }
            return res.json(DEFAULT_JOB_STATUSES);
        }

        // Handle legacy format (array of strings)
        if (Array.isArray(setting.value) && setting.value.length > 0 && typeof setting.value[0] === 'string') {
            const convertedStatuses = setting.value.map(convertToNewFormat);
            
            // Update the setting to new format
            setting.value = convertedStatuses;
            await settingRepository.save(setting);

            // Return in legacy format if requested
            if (req.query.format === 'legacy') {
                return res.json(setting.value.map(convertToLegacyFormat));
            }
            return res.json(convertedStatuses);
        }

        // Return in legacy format if requested
        if (req.query.format === 'legacy') {
            return res.json(setting.value.map(convertToLegacyFormat));
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
            statuses = value.map(convertToNewFormat);
        }

        // Validate each status has required properties and valid color
        if (!statuses.every(status => 
            typeof status === 'object' &&
            typeof status.name === 'string' &&
            typeof status.color === 'string' &&
            VALID_COLORS.includes(status.color)
        )) {
            return res.status(400).json({
                message: 'Each status must have a name (string) and valid color'
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

        // Return in legacy format if requested
        if (req.query.format === 'legacy') {
            return res.json(updated.value.map(convertToLegacyFormat));
        }
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating job statuses:', error);
        return res.status(500).json({ 
            message: 'Failed to update job statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
