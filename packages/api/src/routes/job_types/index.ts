import { Router } from 'express';
import { AppDataSource } from '../../config/database';
import { Setting } from '../../entities/Setting';

const router = Router();
const JOB_TYPES_SETTING_KEY = 'job_types';

router.get('/', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        const jobTypesSetting = await settingsRepository.findOne({
            where: { key: JOB_TYPES_SETTING_KEY }
        });

        // Convert settings-based job types to format expected by AddJobDialog
        const jobTypes = (jobTypesSetting?.value || []).map((name: string) => ({
            id: name, // Use name as ID since these are simple strings
            name: name
        }));

        res.json({ jobTypes });
    } catch (error) {
        console.error('Error fetching job types:', error);
        res.status(500).json({ error: 'Failed to fetch job types' });
    }
});

router.post('/', async (req, res) => {
    try {
        const settingsRepository = AppDataSource.getRepository(Setting);
        const { value } = req.body;

        let jobTypesSetting = await settingsRepository.findOne({
            where: { key: JOB_TYPES_SETTING_KEY }
        });

        if (!jobTypesSetting) {
            jobTypesSetting = new Setting();
            jobTypesSetting.key = JOB_TYPES_SETTING_KEY;
        }

        jobTypesSetting.value = value;
        await settingsRepository.save(jobTypesSetting);

        res.json({ success: true, value: jobTypesSetting.value });
    } catch (error) {
        console.error('Error updating job types:', error);
        res.status(500).json({ error: 'Failed to update job types' });
    }
});

export default router;
