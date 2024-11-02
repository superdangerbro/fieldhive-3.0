import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const EQUIPMENT_STATUSES_KEY = 'equipment_statuses';
const DEFAULT_EQUIPMENT_STATUSES = [
    { name: 'Available', color: 'success' },
    { name: 'In Use', color: 'warning' },
    { name: 'Under Maintenance', color: 'error' }
];

const VALID_COLORS = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];

// Helper function to convert legacy string to new format
const convertToNewFormat = (status: string) => {
    const colorMap: Record<string, string> = {
        'available': 'success',
        'in_use': 'warning',
        'under_maintenance': 'error'
    };

    return {
        name: status,
        color: colorMap[status.toLowerCase().replace(/\s+/g, '_')] || 'default'
    };
};

export async function getEquipmentStatuses(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: EQUIPMENT_STATUSES_KEY }
        });
        
        if (!setting) {
            // Return default statuses if none are set
            const newSetting = settingRepository.create({
                key: EQUIPMENT_STATUSES_KEY,
                value: DEFAULT_EQUIPMENT_STATUSES
            });
            await settingRepository.save(newSetting);
            return res.json(DEFAULT_EQUIPMENT_STATUSES);
        }

        // Handle legacy format (array of strings)
        if (Array.isArray(setting.value) && setting.value.length > 0 && typeof setting.value[0] === 'string') {
            const convertedStatuses = setting.value.map(convertToNewFormat);
            
            // Update the setting to new format
            setting.value = convertedStatuses;
            await settingRepository.save(setting);
            return res.json(convertedStatuses);
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

        const { value } = req.body;

        if (!Array.isArray(value)) {
            return res.status(400).json({ 
                message: 'Equipment statuses must be an array'
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
            where: { key: EQUIPMENT_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: EQUIPMENT_STATUSES_KEY,
                value: statuses
            });
        } else {
            setting.value = statuses;
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
