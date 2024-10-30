import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Setting } from '../../entities/Setting';
import { logger } from '../../utils/logger';

const router = Router();
const JOB_TYPES_SETTING_KEY = 'job_types';

// Get job types
router.get('/job-types', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        const jobTypesSetting = await settingsRepository.findOne({
            where: { key: JOB_TYPES_SETTING_KEY }
        });

        // If no job types exist, create default ones
        if (!jobTypesSetting) {
            const defaultJobTypes = ['Inspection', 'Maintenance', 'Repair', 'Installation', 'Emergency'];
            const newSetting = settingsRepository.create({
                key: JOB_TYPES_SETTING_KEY,
                value: defaultJobTypes
            });
            await settingsRepository.save(newSetting);
            return res.json({ jobTypes: defaultJobTypes.map(type => ({ id: type, name: type })) });
        }

        const jobTypes = jobTypesSetting.value;
        res.json({ jobTypes: jobTypes.map((type: string) => ({ id: type, name: type })) });
    } catch (error) {
        logger.error('Error fetching job types:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch job types',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;
