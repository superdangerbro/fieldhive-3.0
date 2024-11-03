import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';

// Types that match the web side
interface AccountType {
    value: string;
    label: string;
}

const SETTING_KEY = 'account_types';

/**
 * Get account types from settings
 */
export async function getAccountTypes(req: Request, res: Response) {
    try {
        const setting = await AppDataSource
            .getRepository(Setting)
            .findOne({ where: { key: SETTING_KEY } });
        
        if (!setting) {
            return res.json([]);
        }

        // Return array directly
        return res.json(Array.isArray(setting.value) ? setting.value : []);
    } catch (error) {
        return res.status(500).json({ 
            message: 'Failed to get account types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update account types in settings
 */
export async function updateAccountTypes(req: Request, res: Response) {
    try {
        const types = req.body;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!Array.isArray(types)) {
            return res.status(400).json({ 
                message: 'Invalid format - expected array of account types'
            });
        }

        // Validate each type
        for (const type of types) {
            if (!type.value || !type.label) {
                return res.status(400).json({
                    message: 'Each type must have value and label properties'
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
            message: 'Failed to update account types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
