import { AppDataSource } from '../core/config/database';
import { Setting } from '../domains/settings/entities/Setting';
import { logger } from '../core/utils/logger';

async function cleanupAccountSettings() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');

        const settingRepository = AppDataSource.getRepository(Setting);

        // Verify account_statuses and account_types exist before deleting account_settings
        const [accountStatuses, accountTypes] = await Promise.all([
            settingRepository.findOne({ where: { key: 'account_statuses' } }),
            settingRepository.findOne({ where: { key: 'account_types' } })
        ]);

        if (!accountStatuses || !accountTypes) {
            logger.error('Cannot delete account_settings: Migration not complete');
            logger.error('Missing:', {
                accountStatuses: !accountStatuses ? 'account_statuses' : null,
                accountTypes: !accountTypes ? 'account_types' : null
            });
            return;
        }

        // Delete account_settings
        const result = await settingRepository.delete({ key: 'account_settings' });
        
        if (result.affected && result.affected > 0) {
            logger.info('Successfully deleted account_settings');
        } else {
            logger.info('No account_settings entry found to delete');
        }

        logger.info('Cleanup completed successfully');

    } catch (error) {
        logger.error('Error during cleanup:', error);
        throw error;
    } finally {
        await AppDataSource.destroy();
    }
}

cleanupAccountSettings().catch(console.error);
