import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const JOB_TYPES_KEY = 'job_types';

interface JobTypeConfig {
    name: string;
    fields: Array<{
        name: string;
        type: string;
        required: boolean;
        options?: string[];
        numberConfig?: {
            min?: number;
            max?: number;
            step?: number;
        };
        showWhen?: Array<{
            field: string;
            value: any;
            makeRequired?: boolean;
        }>;
    }>;
}

export async function getJobTypes(req: Request, res: Response) {
    try {
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: JOB_TYPES_KEY }
        });
        
        if (!setting) {
            return res.json([]);
        }

        return res.json(setting.value);
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
        const settingRepository = AppDataSource.getRepository(Setting);
        const { value } = req.body; // Extract value from request body

        if (!Array.isArray(value)) {
            return res.status(400).json({ 
                message: 'Job types must be an array'
            });
        }

        // Validate each type has required properties
        if (!value.every(type => 
            typeof type === 'object' &&
            typeof type.name === 'string' &&
            Array.isArray(type.fields)
        )) {
            return res.status(400).json({
                message: 'Each type must have a name (string) and fields array'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: JOB_TYPES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: JOB_TYPES_KEY,
                value
            });
        } else {
            setting.value = value;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating job types:', error);
        return res.status(500).json({ 
            message: 'Failed to update job types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
