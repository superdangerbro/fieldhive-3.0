import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const DOMAIN_STATUSES_KEY = 'domain_statuses';
const VALID_DOMAINS = ['equipment', 'jobs', 'accounts', 'properties', 'inspections'];

// Preset theme colors for the color picker
const PRESET_COLORS = {
    primary: '#6366f1',
    secondary: '#ec4899',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#10b981',
    default: '#94a3b8'
};

interface StatusConfig {
    name: string;
    color: string; // Any valid CSS color (hex, rgb, etc)
}

// Get statuses for a specific domain
export async function getDomainStatuses(req: Request, res: Response) {
    const { domain } = req.params;

    if (!VALID_DOMAINS.includes(domain)) {
        return res.status(400).json({
            message: `Invalid domain. Must be one of: ${VALID_DOMAINS.join(', ')}`
        });
    }

    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: DOMAIN_STATUSES_KEY }
        });

        // Return empty array if no statuses exist yet
        const statuses = setting?.value?.[domain] || [];

        return res.json({
            statuses,
            presetColors: PRESET_COLORS // Provide preset colors for the color picker
        });
    } catch (error) {
        logger.error(`Error getting ${domain} statuses:`, error);
        return res.status(500).json({ 
            message: `Failed to get ${domain} statuses`,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update statuses for a specific domain
export async function updateDomainStatuses(req: Request, res: Response) {
    const { domain } = req.params;
    const { statuses } = req.body;

    if (!VALID_DOMAINS.includes(domain)) {
        return res.status(400).json({
            message: `Invalid domain. Must be one of: ${VALID_DOMAINS.join(', ')}`
        });
    }

    if (!Array.isArray(statuses)) {
        return res.status(400).json({
            message: 'Statuses must be an array'
        });
    }

    // Validate status objects
    const isValidStatus = (status: any): status is StatusConfig => {
        return (
            typeof status === 'object' &&
            typeof status.name === 'string' &&
            typeof status.color === 'string' &&
            /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(status.color) // Validate hex color
        );
    };

    if (!statuses.every(isValidStatus)) {
        return res.status(400).json({
            message: 'Each status must have a name (string) and valid hex color (e.g., "#ff0000")'
        });
    }

    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        
        let setting = await settingRepository.findOne({
            where: { key: DOMAIN_STATUSES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: DOMAIN_STATUSES_KEY,
                value: {}
            });
        }

        // Update the statuses for the specified domain
        setting.value = {
            ...setting.value,
            [domain]: statuses
        };

        const updated = await settingRepository.save(setting);
        
        return res.json({
            statuses: updated.value[domain],
            presetColors: PRESET_COLORS
        });
    } catch (error) {
        logger.error(`Error updating ${domain} statuses:`, error);
        return res.status(500).json({ 
            message: `Failed to update ${domain} statuses`,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
