import { AppDataSource } from '../config/database';
import { logger } from '../utils/logger';

async function cleanMigrations() {
    try {
        logger.info('Connecting to database...');
        await AppDataSource.initialize();

        logger.info('Cleaning migrations table...');
        await AppDataSource.query(`
            DELETE FROM migrations 
            WHERE name IN (
                'UpdatePropertyAddresses1698285080000',
                'UpdateAddressStructure1698285090000',
                'CleanupAndMoveToSettings1698285100000'
            );
        `);

        logger.info('Migrations cleaned successfully');
    } catch (error) {
        logger.error('Error cleaning migrations:', error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

cleanMigrations().catch(error => {
    logger.error('Script failed:', error);
    process.exit(1);
});
