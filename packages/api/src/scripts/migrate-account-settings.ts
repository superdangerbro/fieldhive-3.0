import { AppDataSource } from '../core/config/database';
import { Setting } from '../domains/settings/entities/Setting';
import { logger } from '../core/utils/logger';

async function migrateAccountSettings() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');

        const settingRepository = AppDataSource.getRepository(Setting);

        // Get current account_settings
        const accountSettings = await settingRepository.findOne({
            where: { key: 'account_settings' }
        });

        if (!accountSettings) {
            logger.error('No account_settings found to migrate');
            return;
        }

        // Extract statuses
        const statuses = accountSettings.value.statuses;
        logger.info('Current account statuses:', statuses);

        // Create new account_statuses entry
        const accountStatuses = settingRepository.create({
            key: 'account_statuses',
            value: { statuses }
        });

        await settingRepository.save(accountStatuses);
        logger.info('Successfully created account_statuses');

        // Extract types
        const types = accountSettings.value.types;
        logger.info('Current account types:', types);

        // Create new account_types entry
        const accountTypes = settingRepository.create({
            key: 'account_types',
            value: { types }
        });

        await settingRepository.save(accountTypes);
        logger.info('Successfully created account_types');

        logger.info('Migration completed successfully');

    } catch (error) {
        logger.error('Error during migration:', error);
        throw error;
    } finally {
        await AppDataSource.destroy();
    }
}

migrateAccountSettings().catch(console.error);
