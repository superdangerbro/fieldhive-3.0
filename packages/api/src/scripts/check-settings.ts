import { AppDataSource } from '../core/config/database';
import { Setting } from '../domains/settings/entities/Setting';
import { logger } from '../utils/logger';

async function checkSettings() {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected');

        // Check if settings table exists
        const tableExists = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'settings'
            );
        `);
        logger.info('Settings table exists:', tableExists[0].exists);

        if (tableExists[0].exists) {
            // Check table structure
            const columns = await AppDataSource.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'settings';
            `);
            logger.info('Settings table structure:', columns);

            // Check existing settings
            const settings = await AppDataSource.getRepository(Setting).find();
            logger.info('Existing settings:', settings);
        }

        await AppDataSource.destroy();
    } catch (error) {
        logger.error('Error checking settings:', error);
        process.exit(1);
    }
}

checkSettings().catch(console.error);
