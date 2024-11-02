import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../utils/logger';

const router = Router();
const EQUIPMENT_TYPES_KEY = 'equipment_types';
const EQUIPMENT_STATUS_KEY = 'equipment_status';

// Get equipment type configurations
router.get('/', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        const setting = await settingsRepository.findOne({ 
            where: { key: EQUIPMENT_TYPES_KEY } 
        });
        res.json(setting?.value || []);
    } catch (error) {
        logger.error('Error fetching equipment types:', error);
        res.status(500).json({ error: 'Failed to fetch equipment types' });
    }
});

// Save equipment type configurations
router.post('/', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        let setting = await settingsRepository.findOne({
            where: { key: EQUIPMENT_TYPES_KEY }
        });

        if (!setting) {
            setting = new Setting();
            setting.key = EQUIPMENT_TYPES_KEY;
        }

        setting.value = req.body;
        await settingsRepository.save(setting);

        res.json({ success: true, value: setting.value });
    } catch (error) {
        logger.error('Error saving equipment types:', error);
        res.status(500).json({ error: 'Failed to save equipment types' });
    }
});

// Get equipment status configurations
router.get('/status', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        const setting = await settingsRepository.findOne({ 
            where: { key: EQUIPMENT_STATUS_KEY } 
        });
        res.json(setting?.value || []);
    } catch (error) {
        logger.error('Error fetching equipment statuses:', error);
        res.status(500).json({ error: 'Failed to fetch equipment statuses' });
    }
});

// Save equipment status configurations
router.post('/status', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        let setting = await settingsRepository.findOne({
            where: { key: EQUIPMENT_STATUS_KEY }
        });

        if (!setting) {
            setting = new Setting();
            setting.key = EQUIPMENT_STATUS_KEY;
        }

        setting.value = req.body;
        await settingsRepository.save(setting);

        res.json({ success: true, value: setting.value });
    } catch (error) {
        logger.error('Error saving equipment statuses:', error);
        res.status(500).json({ error: 'Failed to save equipment statuses' });
    }
});

export default router;
