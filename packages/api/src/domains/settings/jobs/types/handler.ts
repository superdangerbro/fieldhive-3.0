import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';

// Types that match the web side
interface JobType {
    value: string;    // Used as identifier
    label: string;    // Display name
    fields: any[];    // Type-specific fields
}

const SETTING_KEY = 'job_types';

/**
 * Get job types from settings
 */
export async function getJobTypes(req: Request, res: Response) {
    try {
        const setting = await AppDataSource
            .getRepository(Setting)
            .findOne({ where: { key: SETTING_KEY } });
        
        if (!setting) {
            return res.json([]);
        }

        // Transform old format if needed
        const types = Array.isArray(setting.value) ? setting.value : [];
        const transformedTypes = types.map(type => ({
            value: type.name?.toLowerCase() || type.value,
            label: type.name || type.label,
            fields: type.fields || []
        }));

        return res.json(transformedTypes);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to get job types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update job types in settings
 */
export async function updateJobTypes(req: Request, res: Response) {
    try {
        const types = req.body;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!Array.isArray(types)) {
            return res.status(400).json({ 
                message: 'Invalid format - expected array of job types'
            });
        }

        // Validate each type
        for (const type of types) {
            if (!type.value || !type.label || !Array.isArray(type.fields)) {
                return res.status(400).json({
                    message: 'Each type must have value, label, and fields properties'
                });
            }
        }

        // Update or create the setting
        let setting = await repository.findOne({ where: { key: SETTING_KEY } });
        if (!setting) {
            setting = repository.create({ key: SETTING_KEY, value: types });
        } else {
            setting.value = types;
        }

        const updated = await repository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to update job types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
