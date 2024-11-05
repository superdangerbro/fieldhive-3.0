import { Request, Response } from 'express';
import { AppDataSource } from '../../../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../../../utils/logger';

const settingRepository = AppDataSource.getRepository(Setting);
const SETTING_KEY = 'property_statuses';

export async function getPropertyStatuses(req: Request, res: Response) {
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

        logger.info(`Retrieved property statuses:`, setting.value);
        res.json(setting.value);
    } catch (error) {
        logger.error('Error fetching property statuses:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch property statuses',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

export async function updatePropertyStatuses(req: Request, res: Response) {
    try {
        const { statuses } = req.body;
        if (!Array.isArray(statuses) || statuses.some(status => typeof status !== 'string')) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Statuses must be an array of strings'
            });
        }

        let setting = await settingRepository.findOne({
            where: { key: SETTING_KEY }
        });

        if (!setting) {
            setting = settingRepository.create({
                key: SETTING_KEY,
                value: statuses
            });
        } else {
            setting.value = statuses;
        }

        await settingRepository.save(setting);
        logger.info(`Updated property statuses:`, statuses);
        res.json(setting.value);
    } catch (error) {
        logger.error('Error updating property statuses:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update property statuses',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
