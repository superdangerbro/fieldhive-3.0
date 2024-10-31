import { AppDataSource } from '../config/database';
import { Setting } from '../entities/Setting';
import { logger } from '../utils/logger';

async function setupPropertySettings() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connection initialized');

        const settingsRepository = AppDataSource.getRepository(Setting);

        // Set up property types
        const propertyTypes = ['residential', 'commercial', 'industrial', 'agricultural', 'other'];
        await settingsRepository.save({
            key: 'property_types',
            value: propertyTypes
        });
        logger.info('Property types set up:', propertyTypes);

        // Set up property statuses
        const propertyStatuses = ['Active', 'Inactive', 'Archived', 'Pending'];
        await settingsRepository.save({
            key: 'property_statuses',
            value: propertyStatuses
        });
        logger.info('Property statuses set up:', propertyStatuses);

        logger.info('Property settings setup complete');
        process.exit(0);
    } catch (error) {
        logger.error('Error setting up property settings:', error);
        process.exit(1);
    }
}

setupPropertySettings();
