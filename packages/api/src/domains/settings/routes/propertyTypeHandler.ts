import { Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../../../core/utils/logger';

const PROPERTY_TYPES_KEY = 'property_types';
const DEFAULT_PROPERTY_TYPES = {
    types: [
        { name: 'Residential' },
        { name: 'Commercial' },
        { name: 'Industrial' },
        { name: 'Agricultural' },
        { name: 'Other' }
    ]
};

export async function getPropertyTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);
        
        const setting = await settingRepository.findOne({
            where: { key: PROPERTY_TYPES_KEY }
        });
        
        if (!setting) {
            // Return default types if none are set
            const newSetting = settingRepository.create({
                key: PROPERTY_TYPES_KEY,
                value: DEFAULT_PROPERTY_TYPES
            });
            await settingRepository.save(newSetting);
            return res.json(DEFAULT_PROPERTY_TYPES);
        }

        return res.json(setting.value);
    } catch (error) {
        logger.error('Error getting property types:', error);
        return res.status(500).json({ 
            message: 'Failed to get property types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export async function updatePropertyTypes(req: Request, res: Response) {
    try {
        // Initialize repository for each request
        const settingRepository = AppDataSource.getRepository(Setting);

        const { value } = req.body;

        // Validate the structure
        if (!value?.types || !Array.isArray(value.types)) {
            return res.status(400).json({ 
                message: 'Invalid property types format. Expected { types: [...] }'
            });
        }

        // Validate each type object
        for (const type of value.types) {
            if (!type.name) {
                return res.status(400).json({
                    message: 'Each type must have a name property'
                });
            }
        }

        let setting = await settingRepository.findOne({
            where: { key: PROPERTY_TYPES_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: PROPERTY_TYPES_KEY,
                value: value
            });
        } else {
            setting.value = value;
        }

        const updated = await settingRepository.save(setting);
        return res.json(updated.value);
    } catch (error) {
        logger.error('Error updating property types:', error);
        return res.status(500).json({ 
            message: 'Failed to update property types',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
