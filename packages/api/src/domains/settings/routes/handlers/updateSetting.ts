import { Request, Response } from 'express';
import { SettingService } from '../../services/settingService';
import { UpdateSettingDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const settingService = new SettingService();

export async function updateSetting(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const settingData: UpdateSettingDto = req.body;
        logger.info(`Updating setting ${id}:`, settingData);

        const setting = await settingService.update(id, settingData);

        if (!setting) {
            logger.warn(`Setting not found with ID: ${id}`);
            return res.status(404).json({
                error: 'Not found',
                message: 'Setting not found'
            });
        }

        logger.info('Setting updated successfully:', setting);
        res.json(setting);
    } catch (error) {
        logger.error('Error updating setting:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update setting',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
