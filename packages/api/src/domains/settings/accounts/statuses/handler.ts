import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../../entities/Setting';

// Types that match the web side
interface AccountStatus {
    value: string;
    label: string;
    color: string;
}

interface AccountStatusRequest {
    value: {
        statuses: AccountStatus[];
    };
}

const SETTING_KEY = 'account_statuses';

/**
 * Get account statuses from settings
 */
export async function getAccountStatuses(req: Request, res: Response) {
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
            message: 'Failed to get account statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update account statuses in settings
 */
export async function updateAccountStatuses(req: Request, res: Response) {
    try {
        const { value } = req.body as AccountStatusRequest;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!value?.statuses || !Array.isArray(value.statuses)) {
            return res.status(400).json({ 
                message: 'Invalid account statuses format. Expected { statuses: [...] }'
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
            message: 'Failed to update account statuses',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
