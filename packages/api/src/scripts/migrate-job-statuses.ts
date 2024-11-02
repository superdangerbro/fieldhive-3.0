import { AppDataSource } from '../core/config/database';
import { Setting } from '../domains/settings/entities/Setting';
import { logger } from '../utils/logger';

// Default color mapping for existing statuses
const STATUS_COLOR_MAP = {
    'pending': 'warning',
    'in_progress': 'info',
    'completed': 'success',
    'cancelled': 'error'
} as const;

async function migrateJobStatuses() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');

        const settingRepository = AppDataSource.getRepository(Setting);

        // Get current job statuses
        const setting = await settingRepository.findOne({
            where: { key: 'job_statuses' }
        });

        if (!setting) {
            logger.info('No job statuses found');
            return;
        }

        logger.info('Current job statuses:', setting.value);

        // Convert string statuses to object format with colors
        const newStatuses = setting.value.map((status: string) => ({
            name: status,
            color: STATUS_COLOR_MAP[status.toLowerCase() as keyof typeof STATUS_COLOR_MAP] || 'default'
        }));

        // Update the setting
        setting.value = newStatuses;
        await settingRepository.save(setting);

        logger.info('Job statuses migrated to new format:', newStatuses);

    } catch (error) {
        logger.error('Error migrating job statuses:', error);
        throw error;
    } finally {
        await AppDataSource.destroy();
    }
}

// Run the migration
migrateJobStatuses().catch(console.error);
