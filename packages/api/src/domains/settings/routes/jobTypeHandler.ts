import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const JOB_TYPES_KEY = 'job_types';
const DEFAULT_JOB_TYPES = ['Inspection', 'Maintenance', 'Repair'];

export async function getJobTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: JOB_TYPES_KEY }
        });
        
        if (!setting) {
            // Return default types if none are set
            const newSetting = settingRepository.create({
                key: JOB_TYPES_KEY,
                value: DEFAULT_JOB_TYPES
            });
            await settingRepository.save(newSetting);
            return res.json({ jobTypes: DEFAULT_JOB_TYPES.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '_'), name })) });
        }

        // Return in consistent format
        const types = setting.value as string[];
        return res.json({ 
            jobTypes: types.map(name => ({ 
                id: name.toLowerCase().replace(/\s+/g, '_'),
                name 
            }))
        });
    } catch (error) {
        logger.error('Error getting job types:', error);
        return res.status(500).json({ 
            message: 'Failed to get job types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updateJobTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        // Handle both array and object formats
        let types: string[];
        if (Array.isArray(value)) {
            types = value;
        } else if (value?.jobTypes) {
            types = value.jobTypes.map((type: any) => type.name);
        } else {
            return res.status(400).json({ 
                message: 'Invalid job types format'
            });
        }

        // Validate each type is a string
        if (!types.every(type => typeof type === 'string')) {
            return res.status(400).json({
                message: 'Each type must be a string'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: JOB_TYPES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: JOB_TYPES_KEY,
                value: types
            });
        } else {
            setting.value = types;
        }

        const updated = await settingRepository.save(setting);
        
        // Return in consistent format
        return res.json({ 
            jobTypes: (updated.value as string[]).map(name => ({ 
                id: name.toLowerCase().replace(/\s+/g, '_'),
                name 
            }))
        });
    } catch (error) {
        logger.error('Error updating job types:', error);
        return res.status(500).json({ 
            message: 'Failed to update job types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
