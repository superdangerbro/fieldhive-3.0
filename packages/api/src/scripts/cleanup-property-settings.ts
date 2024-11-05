import { AppDataSource } from '../config/database';
import { Setting } from '../domains/settings/entities/Setting';
import { logger } from '../utils/logger';

async function cleanupPropertySettings() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');

        const settingRepository = AppDataSource.getRepository(Setting);

        // Clean up property types
        const propertyTypes = await settingRepository.findOne({
            where: { key: 'property_types' }
        });
        if (propertyTypes) {
            // Remove the setting so it can be recreated with correct format
            await settingRepository.delete(propertyTypes.id);
            logger.info('Removed incorrectly formatted property types');
        }

        // Clean up property statuses
        const propertyStatuses = await settingRepository.findOne({
            where: { key: 'property_statuses' }
        });
        if (propertyStatuses) {
            // Remove the setting so it can be recreated with correct format
            await settingRepository.delete(propertyStatuses.id);
            logger.info('Removed incorrectly formatted property statuses');
        }

        logger.info('Property settings cleanup complete');
        process.exit(0);
    } catch (error) {
        logger.error('Error cleaning up property settings:', error);
        process.exit(1);
    }
}

// Run if this script is executed directly
if (require.main === module) {
    cleanupPropertySettings();
}
