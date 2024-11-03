import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';

// Types that match the web side
interface JobStatus {
    value: string;
    label: string;
    color: string;
}

interface JobStatusRequest {
    value: {
        statuses: JobStatus[];
    };
}

const SETTING_KEY = 'job_statuses';

/**
 * Get job statuses from settings
 */
export async function getJobStatuses(req: Request, res: Response) {
    try {
        const setting = await AppDataSource
            .getRepository(Setting)
            .findOne({ where: { key: SETTING_KEY } });
        
        if (!setting) {
            return res.json({ statuses: [] });
        }

        // Ensure we return { statuses: [...] } format
        return res.json(setting.value?.statuses ? setting.value : { statuses: [] });
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to get job statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update job statuses in settings
 */
export async function updateJobStatuses(req: Request, res: Response) {
    try {
        const { value } = req.body as JobStatusRequest;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!value?.statuses || !Array.isArray(value.statuses)) {
            return res.status(400).json({ 
                message: 'Invalid job statuses format. Expected { statuses: [...] }'
            });
        }

        // Validate each status
        for (const status of value.statuses) {
            if (!status.value || !status.label || !status.color) {
                return res.status(400).json({
                    message: 'Each status must have value, label, and color properties'
                });
            }
        }

        // Update or create the setting
        let setting = await repository.findOne({ where: { key: SETTING_KEY } });
        if (!setting) {
            setting = repository.create({ key: SETTING_KEY, value });
        } else {
            setting.value = value;
        }

        const updated = await repository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to update job statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
