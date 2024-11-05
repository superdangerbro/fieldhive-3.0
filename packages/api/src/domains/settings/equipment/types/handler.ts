import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';

// Types that match the web side
interface EquipmentType {
    name: string;
    fields: any[]; // TODO: Define field types when needed
}

const SETTING_KEY = 'equipment_types';

/**
 * Get equipment types from settings
 */
export async function getEquipmentTypes(req: Request, res: Response) {
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
            message: 'Failed to get equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

/**
 * Update equipment types in settings
 */
export async function updateEquipmentTypes(req: Request, res: Response) {
    try {
        const types = req.body;
        const repository = AppDataSource.getRepository(Setting);

        // Validate the structure
        if (!Array.isArray(types)) {
            return res.status(400).json({ 
                message: 'Invalid format - expected array of equipment types'
            });
        }

        // Validate each type
        for (const type of types) {
            if (!type.name || !Array.isArray(type.fields)) {
                return res.status(400).json({
                    message: 'Each type must have name and fields properties'
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
            message: 'Failed to update equipment types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}