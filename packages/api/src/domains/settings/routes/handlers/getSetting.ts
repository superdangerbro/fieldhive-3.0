import { Request, Response } from 'express';
import { SettingService } from '../../services/settingService';
import { logger } from '../../../../core/utils/logger';

const settingService = new SettingService();

export async function getSetting(req: Request, res: Response) {
    try {
        const { id } = req.params;
        logger.info(`Getting setting with ID: ${id}`);

        const setting = await settingService.findById(id);

        if (!setting) {
            logger.warn(`Setting not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Setting not found'
            });
        }

        logger.info(`Found setting:`, setting);
        res.json(setting);
    } catch (error) {
        logger.error('Error fetching setting:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch setting',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
