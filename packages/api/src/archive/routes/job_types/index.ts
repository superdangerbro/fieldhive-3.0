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

        // Convert settings-based job types to format expected by components
        const jobTypes = (jobTypesSetting?.value || []).map((name: string) => ({
            id: name.toLowerCase().replace(/\s+/g, '_'), // Create stable ID from name
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

        // Ensure value is an array of strings
        if (!Array.isArray(value)) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Value must be an array of strings'
            });
        }

        // Clean up and validate job types
        const cleanedTypes = value
            .map(v => String(v).trim())
            .filter(v => v.length > 0);

        if (cleanedTypes.length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'At least one valid job type is required'
            });
        }

        jobTypesSetting.value = cleanedTypes;
        await settingsRepository.save(jobTypesSetting);

        // Return in the same format as GET
        const formattedTypes = cleanedTypes.map(name => ({
            id: name.toLowerCase().replace(/\s+/g, '_'),
            name: name
        }));

        res.json({ jobTypes: formattedTypes });
    } catch (error) {
        console.error('Error updating job types:', error);
        res.status(500).json({ error: 'Failed to update job types' });
    }
});

export default router;
