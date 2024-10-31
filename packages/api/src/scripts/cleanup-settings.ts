import { AppDataSource } from '../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../utils/logger';

const DEFAULT_JOB_TYPES = ['Inspection', 'Maintenance', 'Repair', 'Installation', 'Emergency'];
const DEFAULT_PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'agricultural', 'other'];
const DEFAULT_PROPERTY_STATUSES = ['Active', 'Inactive', 'Archived', 'Pending'];
const DEFAULT_JOB_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const DEFAULT_EQUIPMENT_STATUSES = ['Available', 'In Use', 'Under Maintenance', 'Out of Service'];

async function cleanupSettings() {
    try {
        await AppDataSource.initialize();
        const settingsRepository = AppDataSource.getRepository(Setting);

        // Get all settings
        const settings = await settingsRepository.find();

        // Group settings by key
        const settingsByKey = settings.reduce((acc, setting) => {
            if (!acc[setting.key]) {
                acc[setting.key] = [];
            }
            acc[setting.key].push(setting);
            return acc;
        }, {} as Record<string, Setting[]>);

        // Clean up each key
        for (const [key, settingsGroup] of Object.entries(settingsByKey)) {
            if (settingsGroup.length > 1) {
                logger.info(`Found ${settingsGroup.length} entries for key: ${key}`);
                
                // Keep the most recent entry
                const sortedSettings = settingsGroup.sort((a, b) => {
                    const aTime = new Date(a.updated_at || a.created_at).getTime();
                    const bTime = new Date(b.updated_at || b.created_at).getTime();
                    return bTime - aTime;
                });

                const keepSetting = sortedSettings[0];
                const deleteSettings = sortedSettings.slice(1);

                // Update the kept setting with default values if needed
                switch (key) {
                    case 'job_types':
                        keepSetting.value = DEFAULT_JOB_TYPES;
                        break;
                    case 'property_types':
                        keepSetting.value = DEFAULT_PROPERTY_TYPES;
                        break;
                    case 'property_statuses':
                        keepSetting.value = DEFAULT_PROPERTY_STATUSES;
                        break;
                    case 'job_statuses':
                        keepSetting.value = DEFAULT_JOB_STATUSES;
                        break;
                    case 'equipment_statuses':
                        keepSetting.value = DEFAULT_EQUIPMENT_STATUSES;
                        break;
                }

                // Save the updated setting
                await settingsRepository.save(keepSetting);
                logger.info(`Updated setting ${key} with value:`, keepSetting.value);

                // Delete duplicate settings
                for (const setting of deleteSettings) {
                    await settingsRepository.remove(setting);
                    logger.info(`Deleted duplicate setting for key: ${key}`);
                }
            }
        }

        logger.info('Settings cleanup completed successfully');
    } catch (error) {
        logger.error('Error cleaning up settings:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

// Run the cleanup
cleanupSettings().catch(console.error);
