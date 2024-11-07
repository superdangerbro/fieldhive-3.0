import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../../../utils/logger';

interface PropertyType {
    value: string;
    label: string;
}

const settingRepository = AppDataSource.getRepository(Setting);
const SETTING_KEY = 'property_types';

function validatePropertyType(type: any): type is PropertyType {
    return (
        typeof type === 'object' &&
        typeof type.value === 'string' &&
        typeof type.label === 'string'
    );
}

export async function getPropertyTypes(req: Request, res: Response) {
    try {
        const setting = await settingRepository.findOne({
            where: { key: SETTING_KEY }
        });

        if (!setting) {
            logger.warn(`Setting not found: ${SETTING_KEY}`);
            return res.json([]);
        }

        // If value is not in the expected format, return empty array
        if (!Array.isArray(setting.value)) {
            logger.warn(`Invalid setting format for: ${SETTING_KEY}`);
            return res.json([]);
        }

        // Remove color property from response if it exists
        const types = setting.value.map(({ color, ...rest }) => rest);
        logger.info(`Retrieved property types:`, types);
        res.json(types);
    } catch (error) {
        logger.error('Error fetching property types:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property types',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

export async function updatePropertyTypes(req: Request, res: Response) {
    try {
        const types = req.body;
        
        // Validate request body
        if (!Array.isArray(types)) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Request body must be an array'
            });
        }

        // Validate each type
        for (const type of types) {
            if (!validatePropertyType(type)) {
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Each type must have value and label properties'
                });
            }
        }

        let setting = await settingRepository.findOne({
            where: { key: SETTING_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: SETTING_KEY,
                value: types
            });
        } else {
            setting.value = types;
        }

        await settingRepository.save(setting);
        logger.info(`Updated property types:`, types);
        res.json(types);
    } catch (error) {
        logger.error('Error updating property types:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property types',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
