import { Request, Response } from 'express';
import { SettingService } from '../../services/settingService';
import { CreateSettingDto } from '../../types';
import { logger } from '../../../../core/utils/logger';

const settingService = new SettingService();

export async function createSetting(req: Request, res: Response) {
    try {
        const settingData: CreateSettingDto = req.body;
        logger.info('Creating new setting:', settingData);

        const setting = await settingService.create(settingData);
        
        logger.info('Setting created successfully:', setting);
        res.status(201).json(setting);
    } catch (error) {
        logger.error('Error creating setting:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create setting',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
